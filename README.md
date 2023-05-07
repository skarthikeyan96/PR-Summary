<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>


# PR Summary

PR Summary is a GitHub Action that generates a summary of a pull request (PR) and adds it as a comment to the PR. The summary includes the PR title, description, and a generated summary of the changes made in the PR.

## How it works

1. When a new pull request is opened, the GitHub Action is triggered.
2. The action fetches the PR information using the GitHub API, including the PR title, description, and diff.
3. The diff is passed to the OpenAI API to generate a summary of the changes made in the PR.
4. The action adds a comment to the PR with the PR summary.

## Usage

```
name: PR summary
on:
  pull_request:
    types:
      - "opened"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Check out repo
      uses: actions/checkout@v2
    - name: Use Node
      uses: actions/setup-node@v2
      with:
        node-version: '16.x'
    - name: Install deps
      run: npm install
    - name: Run PR summary action
      uses: skarthikeyan96/typescript-custom-action@0.0.1
      with:
        OPENAI_API_KEY:  ${{ secrets.OPENAI_API_KEY }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        
```

Note:

Giving read and write permission as the action will be post an comment in the PR.

<img width="1440" alt="image" src="https://user-images.githubusercontent.com/23126394/236687406-1ed5ae85-62d5-4535-8462-c1db26a27970.png">


