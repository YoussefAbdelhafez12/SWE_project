const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.expo' && f !== 'team_zips') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

// Get ALL files in backend and frontend (and root config files like render.yaml)
let allFiles = [];
walkDir('.', (filePath) => {
  // Normalize path separators
  const normalizedPath = filePath.split(path.sep).join('/');
  
  // Exclude certain unnecessary files
  if (normalizedPath.includes('package-lock.json')) return;
  if (normalizedPath.includes('.gitignore')) return;
  if (normalizedPath.endsWith('.js') || normalizedPath.endsWith('.json') || normalizedPath.endsWith('.yaml') || normalizedPath.endsWith('.env') || normalizedPath.includes('assets/')) {
    allFiles.push(normalizedPath);
  }
});

// The 8 team members
const members = [
  "Omar_Samer",
  "Moaz_Abdelaleem",
  "Baha_Ahmed",
  "Ali_Mohamed",
  "Omar_Khaled",
  "Youssef_Hassan",
  "Eyad_Ahmed",
  "Omar_Mahmoud"
];

// Initialize assignments
const assignments = {};
members.forEach(m => assignments[m] = []);

// Rule-based assignment to ensure logical distribution
allFiles.forEach(file => {
  if (file.includes('backend/server.js') || file.includes('backend/middleware') || file.includes('supabase') || file.includes('validators')) {
    assignments["Omar_Samer"].push(file);
  } 
  else if (file.includes('backend/controllers/auth') || file.includes('backend/controllers/admin') || file.includes('backend/routes/auth') || file.includes('backend/routes/admin')) {
    assignments["Moaz_Abdelaleem"].push(file);
  }
  else if (file.includes('backend/controllers') || file.includes('backend/routes')) {
    assignments["Baha_Ahmed"].push(file);
  }
  else if (file.includes('screens/auth') || file.includes('AppNavigator') || file.includes('AuthContext') || file.includes('App.js')) {
    assignments["Ali_Mohamed"].push(file);
  }
  else if (file.includes('screens/worker')) {
    assignments["Omar_Khaled"].push(file);
  }
  else if (file.includes('screens/manager') || file.includes('screens/admin') || file.includes('NotificationsScreen')) {
    assignments["Youssef_Hassan"].push(file);
  }
  else if (file.includes('screens/community') || file.includes('screens/shared')) {
    assignments["Eyad_Ahmed"].push(file);
  }
  else if (file.includes('components') || file.includes('constants') || file.includes('config') || file.includes('assets')) {
    assignments["Omar_Mahmoud"].push(file);
  }
  else {
    // Fallback: Distribute remaining config files (package.json, render.yaml, etc) evenly
    const minMember = members.reduce((prev, curr) => assignments[prev].length < assignments[curr].length ? prev : curr);
    assignments[minMember].push(file);
  }
});

const outputDir = path.join(__dirname, 'team_zips');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function run() {
  console.log('Generating COMPREHENSIVE ZIP files for all 8 team members...\n');
  
  for (const [member, files] of Object.entries(assignments)) {
    const tempDir = path.join(outputDir, `${member}_temp`);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);
    
    files.forEach(file => {
      const srcPath = path.join(__dirname, file);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(tempDir, file);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
      }
    });
    
    const zipPath = path.join(outputDir, `${member}_Contribution.zip`);
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    
    try {
      execSync(`powershell Compress-Archive -Path "${tempDir}\\*" -DestinationPath "${zipPath}" -Force`);
      console.log(`✅ ${member} ZIP created with ${files.length} files.`);
    } catch (e) {
      console.error(`❌ Failed to zip ${member}: ${e.message}`);
    }
    
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  console.log('\nAll ZIP files have been successfully regenerated with 100% coverage in the "team_zips" folder!');
}

run();
