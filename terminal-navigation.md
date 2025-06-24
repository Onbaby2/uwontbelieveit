# Terminal Navigation Commands

## Basic Navigation

### Change Directory (cd)
```bash
# Navigate to a specific directory
cd /path/to/directory

# Navigate to home directory
cd ~
cd

# Navigate to parent directory
cd ..

# Navigate to previous directory
cd -

# Navigate to root directory
cd /
```

### List Directory Contents
```bash
# List files and directories
ls

# List with details
ls -la

# List only directories
ls -d */

# List with human-readable sizes
ls -lh
```

### Show Current Directory
```bash
# Print working directory
pwd
```

## Practical Examples

### For Your Next.js Project
```bash
# Navigate to your project directory
cd /Users/sadiqrasheed/Downloads/mahmoodihsan/mahmoodihsan

# Navigate to specific project folders
cd app
cd components
cd lib
cd public

# Go back to project root
cd ..
```

### Advanced Navigation
```bash
# Navigate to a directory with spaces (use quotes)
cd "My Documents"

# Navigate using tab completion (type part of name and press Tab)
cd mahmoodihsan[TAB]

# Navigate to a directory relative to current location
cd ./components
cd ../app

# Navigate to a directory using absolute path
cd /Users/sadiqrasheed/Downloads/mahmoodihsan
```

## Useful Aliases (add to ~/.zshrc)
```bash
# Quick navigation aliases
alias home="cd ~"
alias downloads="cd ~/Downloads"
alias projects="cd ~/Downloads/mahmoodihsan"
alias project="cd ~/Downloads/mahmoodihsan/mahmoodihsan"

# After adding aliases, reload shell:
source ~/.zshrc
``` 