const simpleGit = require('simple-git');

const manualMergeFiles = ['package.json', 'yarn.lock', 'package-lock.json', 'src/index.js']
const git = simpleGit({ binary: 'git' });

function parseFilesChangedLog(data) {
  return data.split('\n').filter(Boolean).slice('1')
}

async function prevalidateMerge() {
  console.log(`Validating files ready for merge...`);
  try {
    await git.raw(['fetch', '--all']);
    const lastCommitId = await git.raw(['log', '--merges', 'legacy/main', '--pretty=format:"%H"', '-1'])
    const filesChanged = await git.raw('log', '-m', '-1', 'legacy/main', '--name-only', `--pretty=format: ${JSON.parse(lastCommitId)}`)
      .then(parseFilesChangedLog)

    if (filesChanged.some(file => manualMergeFiles.includes(file))) {
      console.error('ERROR: PACKAGE.JSON CHANGED - Please resolve manually')
      process.exit(1);
    }

    console.log(`Files validated successfully`);
    return JSON.parse(lastCommitId);
  } catch (e) {
    console.error('Something went wrong while validating the merge:', e)
    process.exit(1)
  }
}

async function deleteBranch(branchName) {
  console.log('Deleting branch...')
  try {
    await git.raw(['checkout', 'main']);
    await git.raw('branch', '-d', branchName);
    await git.raw('push', 'origin', '--delete', branchName);
    console.log(`Deleted branch "${branchName}" successfully!`);
    process.exit(0)
  } catch (e) {
    console.error('Something went wrong while deleting the branch:', e);
    process.exit(1)
  }
}

async function createPullRequest(branchName) {
  console.log(`Creating pull request...`);
  try {
    require('child_process').execSync(
      'gh pr create --base main --fill'
    );
    console.log('Pull request created successfully!');
    console.log('Verify changes at: [https://github.com/Rody-Kirwan/test-gg-ui-mfe/pulls]');
    console.log(`Deleting branch "${branchName}" in 2 mins...`);
    setTimeout(async () => {
      await deleteBranch(branchName)
    }, 60000)
  } catch (e) {
    console.error('Something went wrong while creating the PR:', e);
    process.exit(1)
  }
}

async function completeMerge(mergeCommitSha) {
  console.log(`Attempting merge from legacy/main...`);
  try {
    const branchName = `auto_merge_${123}`;
    await git.raw(['checkout', 'main']);
    await git.raw('pull');

    console.log(`Creating temporary branch "${branchName}" from origin/main...`);

    await git.raw('checkout', '-b', branchName);
    await git.raw('fetch', '--all');

    console.log(`Merging changes from legacy/main to "${branchName}"`);

    await git.raw('merge', 'legacy/main')
    await git.raw('push', '--set-upstream', 'origin', branchName);

    console.log(`Merge completed successfully and "${branchName}" pushed to [https://github.com/Rody-Kirwan/test-gg-ui-mfe/tree/${branchName}]`);
    return branchName;
  } catch (e) {
    console.error('Something went wrong while merging changes:', e);
    console.log('Please resolve manually');
    process.exit(1)
  }
}

async function createAutoMergePR() {
  // const commitId = await prevalidateMerge();
  const branchName = await completeMerge();
  await createPullRequest(branchName);
}

createAutoMergePR();
