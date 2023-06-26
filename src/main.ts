import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/core'
import {OpenAIApi, Configuration} from 'openai'
import {backOff} from 'exponential-backoff'

async function run(): Promise<void> {
  try {
    if (github.context.eventName !== 'pull_request') {
      // The core module on the other hand let's you get
      // inputs or create outputs or control the action flow
      // e.g. by producing a fatal error
      core.setFailed('Can only run on pull requests!')
      return
    }

    const github_token = core.getInput('GITHUB_TOKEN')
    const openai_key = core.getInput('OPENAI_API_KEY')

    const octokit = new Octokit({
      auth: github_token
    })

    const configuration = new Configuration({
      apiKey: openai_key
    })

    const openai = new OpenAIApi(configuration)

    // get the pr details

    const {repo, owner, number} = github.context.issue
    try {
      const response = await octokit.request(
        'GET /repos/{owner}/{repo}/pulls/{pull_number}',
        {
          owner,
          repo,
          pull_number: number,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )

      const {title, body, patch_url} = response.data

      const summaryResponse = await backOff(async () =>
        openai.createCompletion({
          model: 'text-davinci-003',
          prompt: `Pull Request Summary: Title: ${title} Description: ${
            body || ''
          } Diff: ${patch_url}`,
          temperature: 0.7,
          max_tokens: 100,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      )

      await octokit.request(
        'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
        {
          owner,
          repo,
          issue_number: number,
          body: summaryResponse.data.choices[0].text || '',
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )
    } catch (error) {
      if (error instanceof Error) core.setFailed(error.message)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
