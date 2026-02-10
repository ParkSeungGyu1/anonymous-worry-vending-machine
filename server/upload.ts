
import { getUncachableGitHubClient } from "./github";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

async function uploadToGitHub() {
  try {
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.users.getAuthenticated();
    const repoName = "anonymous-worry-vending-machine";
    
    console.log(`Creating repository: ${repoName}`);
    
    let repo;
    try {
      const { data } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        private: false,
        description: "Anonymous Worry Vending Machine (익명 고민 자판기)",
      });
      repo = data;
    } catch (e: any) {
      if (e.status === 422) {
        console.log("Repository already exists, skipping creation.");
        const { data } = await octokit.repos.get({
          owner: user.login,
          repo: repoName,
        });
        repo = data;
      } else {
        throw e;
      }
    }

    const filesToUpload: string[] = [];
    const getFiles = (dir: string) => {
      const files = readdirSync(dir);
      for (const file of files) {
        const path = join(dir, file);
        if (statSync(path).isDirectory()) {
          // Skip internal/dependency directories
          if (file === "node_modules" || file === ".git" || file === "dist" || file === ".cache") {
            continue;
          }
          getFiles(path);
        } else {
          filesToUpload.push(path);
        }
      }
    };

    getFiles(".");

    for (const filePath of filesToUpload) {
      const content = readFileSync(filePath);
      const relativePath = relative(".", filePath);
      
      try {
        let sha: string | undefined;
        try {
          const { data } = await octokit.repos.getContent({
            owner: user.login,
            repo: repoName,
            path: relativePath,
          });
          if (!Array.isArray(data)) {
            sha = data.sha;
          }
        } catch (e) {}

        await octokit.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: relativePath,
          message: `Upload ${relativePath}`,
          content: content.toString("base64"),
          sha,
        });
        console.log(`Uploaded: ${relativePath}`);
      } catch (e) {
        console.error(`Failed to upload ${relativePath}:`, e);
      }
    }

    console.log(`Successfully uploaded to https://github.com/${user.login}/${repoName}`);
  } catch (error) {
    console.error("GitHub upload failed:", error);
  }
}

uploadToGitHub();
