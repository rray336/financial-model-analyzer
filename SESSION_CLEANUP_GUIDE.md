# Session Cleanup Guide - Financial Model Analyzer

## Overview

This guide provides a comprehensive plan for safely removing temporary files, test files, and development artifacts at the end of any development session. The cleanup process ensures a clean repository state while preserving all essential project files.

## 🎯 Quick Start

### Python Script (Recommended)
```bash
# Dry run (safe preview)
python scripts/cleanup_session.py

# Execute cleanup
python scripts/cleanup_session.py --execute

# Custom categories
python scripts/cleanup_session.py --execute --categories test_files cache logs
```

### Bash Script (Linux/Mac/WSL)
```bash
# Make executable (first time only)
chmod +x scripts/cleanup_session.sh

# Dry run
./scripts/cleanup_session.sh

# Execute cleanup
./scripts/cleanup_session.sh --execute
```

## 📁 File Categories

### 1. Test Files (`test_files`)
**Project-specific temporary files created for testing:**
- `frontend/src/components/upload/TestDropzone.tsx` - Test component for file upload
- `backend/test_period_api.py` - Period API endpoint tests
- `backend/test_phase3_integration.py` - Phase 3 integration tests
- `frontend/test_badge_logic.js` - Badge classification logic tests
- `frontend/src/components/upload/DebugUpload.tsx` - Debug connectivity component
- `frontend/src/components/dashboard/TempExecutiveSummary.tsx` - Temporary executive summary

**Safety:** These files are explicitly identified and safe to remove as they were created for testing purposes only.

### 2. Cache Files (`cache`)
**Generated files that can be safely regenerated:**
- `**/__pycache__/**/*.pyc` - Python bytecode cache
- `**/.pytest_cache/**` - Pytest cache files
- `**/node_modules/.cache/**` - Node.js build cache
- `**/coverage/**` - Test coverage reports
- `**/.coverage` - Coverage data files

**Safety:** These are automatically generated and can be recreated by running the respective build/test commands.

### 3. Log Files (`logs`)
**Development and runtime log files:**
- `**/*.log` - All log files
- `**/logs/**` - Log directories
- `**/npm-debug.log*` - NPM debug logs
- `**/yarn-debug.log*` - Yarn debug logs

**Safety:** Log files are for debugging and can be safely removed. The cleanup script preserves its own log file.

### 4. Runtime Temp Files (`runtime`)
**Temporary directories created during runtime:**
- `**/tmp/**` - Temporary file directories
- `**/temp/**` - Temporary directories
- `**/uploads/**` - File upload storage
- `**/sessions/**` - Session data storage
- `**/cache/**` - Application cache directories

**Safety:** These are runtime artifacts and safe to remove when not actively developing.

### 5. System Temp Files (`system`)
**OS-generated temporary files:**
- `**/.DS_Store` - macOS folder metadata
- `**/Thumbs.db` - Windows thumbnail cache
- `**/ehthumbs.db` - Windows thumbnail database
- `**/.Trashes` - macOS trash metadata
- `**/desktop.ini` - Windows folder customization

**Safety:** These are OS-generated metadata files and safe to remove.

## 🛡️ Safety Mechanisms

### Protected Files (Never Removed)
The cleanup scripts have built-in protection for essential files:
- Source code files (`*.py`, `*.tsx`, `*.ts`, `*.js`)
- Configuration files (`package.json`, `requirements.txt`, `.gitignore`)
- Documentation (`*.md`, `*.txt`, `README*`, `LICENSE*`)
- Core directories (`src/`, `app/`, `.git/`)

### Verification Process
1. **File Pattern Matching:** Each file is checked against protected patterns
2. **Test File Exceptions:** Known test files can be removed even if they match protected patterns
3. **Directory Safety:** Only empty directories or known temp directories are removed
4. **Dry Run Default:** Scripts default to dry-run mode for safety

### Multi-Level Safety
1. **Script Level:** Built-in safety checks and protected file patterns
2. **Git Level:** `.gitignore` prevents temporary files from being committed
3. **User Level:** Interactive confirmation for destructive operations

## 🔧 Manual Verification Steps

### Before Cleanup
1. **Check Git Status:**
   ```bash
   git status
   ```
   Ensure all important changes are committed.

2. **Backup Check:**
   ```bash
   git log --oneline -5
   ```
   Verify recent commits are properly saved.

3. **Running Services:**
   ```bash
   # Stop development servers
   pkill -f "uvicorn"  # Backend
   pkill -f "npm run dev"  # Frontend
   ```

### After Cleanup
1. **Verify Functionality:**
   ```bash
   # Test backend startup
   cd backend && python -m uvicorn app.main:app --reload --port 8000
   
   # Test frontend startup
   cd frontend && npm run dev
   ```

2. **Check Dependencies:**
   ```bash
   # Python dependencies
   cd backend && pip list
   
   # Node.js dependencies
   cd frontend && npm list
   ```

## 📋 Cleanup Checklist

### Pre-Cleanup Checklist
- [ ] All important code changes are committed to git
- [ ] Development servers are stopped
- [ ] No active file uploads or sessions in progress
- [ ] Current work is saved and backed up

### Cleanup Execution
- [ ] Run cleanup in dry-run mode first
- [ ] Review the preview of files to be removed
- [ ] Execute cleanup with appropriate categories
- [ ] Review cleanup log for any errors

### Post-Cleanup Verification
- [ ] Project still builds and runs correctly
- [ ] Git repository is in clean state
- [ ] No essential files were accidentally removed
- [ ] Development environment functions normally

## 🚨 Emergency Recovery

### If Essential Files Were Removed
1. **Check Git:**
   ```bash
   git status
   git checkout HEAD -- <filename>  # Restore specific file
   ```

2. **Check Cleanup Log:**
   ```bash
   cat cleanup_YYYYMMDD_HHMMSS.log
   ```

3. **Restore from Backup:**
   If you have external backups, restore the removed files.

### If Dependencies Are Broken
1. **Reinstall Python Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Reinstall Node.js Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

## 🔄 Integration with Development Workflow

### Git Hooks Integration

Create `.git/hooks/pre-commit` for automatic cleanup:
```bash
#!/bin/bash
# Auto-cleanup before commits
echo "Running automatic cleanup..."
python scripts/cleanup_session.py --categories cache logs --execute
```

### IDE Integration

**VS Code Task (`.vscode/tasks.json`):**
```json
{
    "label": "Cleanup Session",
    "type": "shell",
    "command": "python",
    "args": ["scripts/cleanup_session.py", "--execute", "--categories", "test_files,cache,logs"],
    "group": "build",
    "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
    }
}
```

### CI/CD Integration

**GitHub Actions (`.github/workflows/cleanup.yml`):**
```yaml
name: Session Cleanup
on:
  workflow_dispatch:
  schedule:
    - cron: '0 2 * * 0'  # Weekly cleanup

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Run Cleanup
        run: python scripts/cleanup_session.py --execute --categories cache logs system
```

## 📊 Cleanup Categories Matrix

| Category | Safety Level | Frequency | Impact |
|----------|-------------|-----------|--------|
| `test_files` | High | End of session | Low - removes test artifacts |
| `cache` | High | Daily/Weekly | None - files regenerate automatically |
| `logs` | High | Weekly | Low - removes debug information |
| `runtime` | Medium | End of session | Medium - may lose session data |
| `system` | High | Weekly | None - removes OS metadata |

## ⚙️ Configuration Options

### Environment Variables
```bash
# Override default project root
export CLEANUP_PROJECT_ROOT="/path/to/project"

# Default categories
export CLEANUP_CATEGORIES="test_files,cache,logs"

# Enable verbose logging
export CLEANUP_VERBOSE=true
```

### Script Arguments
```bash
# Python script options
--dry-run               # Preview mode (default)
--execute               # Execute removal
--categories LIST       # Specify categories
--project-root PATH     # Custom project root
--save-report           # Generate detailed report

# Bash script options
--dry-run               # Preview mode (default)
--execute               # Execute removal
--categories LIST       # Comma-separated categories
--verbose               # Enable verbose output
```

## 📈 Best Practices

### Session End Routine
1. **Stop Services:** Stop all running development servers
2. **Preview Cleanup:** `python scripts/cleanup_session.py`
3. **Execute Cleanup:** `python scripts/cleanup_session.py --execute`
4. **Verify State:** Check that project still works correctly

### Weekly Maintenance
1. **Full Cleanup:** `python scripts/cleanup_session.py --execute --categories test_files cache logs system`
2. **Dependency Update:** Update Python and Node.js dependencies
3. **Repository Check:** Ensure `.gitignore` is comprehensive

### Before Important Commits
1. **Minimal Cleanup:** `python scripts/cleanup_session.py --execute --categories cache`
2. **Code Review:** Review all changes to be committed
3. **Test Suite:** Run full test suite to ensure nothing is broken

## 🔍 Troubleshooting

### Common Issues

**"Permission Denied" Errors:**
- Ensure you have write permissions to the project directory
- Stop any running processes that might be using the files
- On Windows, run command prompt as administrator if needed

**"File Not Found" Warnings:**
- These are normal and indicate files were already removed
- Check cleanup log for details

**Essential File Removed Accidentally:**
- Use `git checkout HEAD -- <filename>` to restore
- Check backup systems if available
- Review cleanup log to understand what happened

### Debug Mode
```bash
# Enable maximum verbosity
python scripts/cleanup_session.py --categories test_files --save-report

# Check detailed log
cat cleanup_report_YYYYMMDD_HHMMSS.json
```

---

## 📞 Support

For questions or issues with the cleanup process:

1. **Check the cleanup log** for detailed information about what was processed
2. **Review this guide** for common solutions and best practices
3. **Test in dry-run mode first** before executing any destructive operations
4. **Keep backups** of important work before running cleanup

---

**Last Updated:** August 2025  
**Version:** 1.0  
**Compatibility:** Python 3.8+, Bash 4.0+, Windows/macOS/Linux