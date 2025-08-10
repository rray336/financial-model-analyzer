#!/bin/bash
# Financial Model Analyzer - Session Cleanup Script (Bash version)
# Safely removes temporary files created during development and testing sessions.

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DRY_RUN=true
CATEGORIES=("test_files" "cache" "logs")
VERBOSE=false
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${PROJECT_ROOT}/cleanup_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
    esac
    
    # Also log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Help function
show_help() {
    cat << EOF
Financial Model Analyzer - Session Cleanup Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --dry-run           Run in dry-run mode (default, shows what would be removed)
    --execute           Actually remove files (overrides --dry-run)
    --categories LIST   Comma-separated list of cleanup categories
                        Options: test_files,cache,logs,runtime,system
                        Default: test_files,cache,logs
    --verbose           Enable verbose output
    --help              Show this help message

EXAMPLES:
    $0                                    # Dry run with default categories
    $0 --execute                          # Execute cleanup with default categories
    $0 --categories test_files,cache      # Clean only test files and cache
    $0 --execute --categories system      # Remove system temp files

CATEGORIES:
    test_files    - Project-specific test and debug files
    cache         - Python __pycache__, node_modules/.cache, etc.
    logs          - Log files and log directories
    runtime       - Runtime temp dirs (uploads, sessions, tmp)
    system        - OS temp files (.DS_Store, Thumbs.db)

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --execute)
                DRY_RUN=false
                shift
                ;;
            --categories)
                if [[ -n "${2-}" ]]; then
                    IFS=',' read -ra CATEGORIES <<< "$2"
                    shift 2
                else
                    log "ERROR" "--categories requires a value"
                    exit 1
                fi
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Check if file/directory is safe to remove
is_safe_to_remove() {
    local path="$1"
    local basename=$(basename "$path")
    
    # Protected patterns - NEVER remove these
    local protected_patterns=(
        "*.md" "*.txt" "*.json" "package.json" "requirements.txt"
        ".gitignore" ".git" "README*" "LICENSE*"
        "src" "app" "frontend/src" "backend/app"
    )
    
    # Test file exceptions - these can be removed even if they match protected patterns
    local test_exceptions=(
        "TestDropzone.tsx" "test_period_api.py" "test_phase3_integration.py"
        "test_badge_logic.js" "DebugUpload.tsx" "TempExecutiveSummary.tsx"
    )
    
    # Check if it's a test file exception
    for exception in "${test_exceptions[@]}"; do
        if [[ "$basename" == "$exception" ]]; then
            return 0  # Safe to remove
        fi
    done
    
    # Check against protected patterns
    for pattern in "${protected_patterns[@]}"; do
        if [[ "$path" == *"$pattern"* ]]; then
            return 1  # Not safe to remove
        fi
    done
    
    return 0  # Safe to remove
}

# Remove file or directory safely
remove_safe() {
    local path="$1"
    local reason="$2"
    
    if ! is_safe_to_remove "$path"; then
        log "WARN" "Skipping protected file: $path"
        return 1
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would remove: $path ($reason)"
        return 0
    fi
    
    if [[ -d "$path" ]]; then
        if rm -rf "$path" 2>/dev/null; then
            log "SUCCESS" "Removed directory: $path"
            return 0
        else
            log "ERROR" "Failed to remove directory: $path"
            return 1
        fi
    elif [[ -f "$path" ]]; then
        if rm -f "$path" 2>/dev/null; then
            log "SUCCESS" "Removed file: $path"
            return 0
        else
            log "ERROR" "Failed to remove file: $path"
            return 1
        fi
    fi
    
    return 1
}

# Clean up test files
cleanup_test_files() {
    log "INFO" "Cleaning up test files..."
    
    local test_files=(
        "$PROJECT_ROOT/frontend/src/components/upload/TestDropzone.tsx"
        "$PROJECT_ROOT/backend/test_period_api.py"
        "$PROJECT_ROOT/backend/test_phase3_integration.py"
        "$PROJECT_ROOT/frontend/test_badge_logic.js"
        "$PROJECT_ROOT/frontend/src/components/upload/DebugUpload.tsx"
        "$PROJECT_ROOT/frontend/src/components/dashboard/TempExecutiveSummary.tsx"
    )
    
    local found=0
    local removed=0
    
    for file in "${test_files[@]}"; do
        if [[ -f "$file" ]]; then
            ((found++))
            if remove_safe "$file" "test_file"; then
                ((removed++))
            fi
        fi
    done
    
    log "INFO" "Test files: Found $found, Processed $removed"
}

# Clean up cache files
cleanup_cache() {
    log "INFO" "Cleaning up cache files..."
    
    local found=0
    local removed=0
    
    # Python cache files
    while IFS= read -r -d '' file; do
        ((found++))
        if remove_safe "$file" "python_cache"; then
            ((removed++))
        fi
    done < <(find "$PROJECT_ROOT" -name "__pycache__" -type d -print0 2>/dev/null || true)
    
    # Python compiled files
    while IFS= read -r -d '' file; do
        ((found++))
        if remove_safe "$file" "python_compiled"; then
            ((removed++))
        fi
    done < <(find "$PROJECT_ROOT" \( -name "*.pyc" -o -name "*.pyo" -o -name "*.pyd" \) -type f -print0 2>/dev/null || true)
    
    # Node.js cache
    while IFS= read -r -d '' file; do
        ((found++))
        if remove_safe "$file" "node_cache"; then
            ((removed++))
        fi
    done < <(find "$PROJECT_ROOT" -path "*/node_modules/.cache" -type d -print0 2>/dev/null || true)
    
    # Coverage files
    while IFS= read -r -d '' file; do
        ((found++))
        if remove_safe "$file" "coverage"; then
            ((removed++))
        fi
    done < <(find "$PROJECT_ROOT" \( -name ".coverage" -o -name "coverage" \) -type f -o -type d -print0 2>/dev/null || true)
    
    log "INFO" "Cache files: Found $found, Processed $removed"
}

# Clean up log files
cleanup_logs() {
    log "INFO" "Cleaning up log files..."
    
    local found=0
    local removed=0
    
    # Find log files
    while IFS= read -r -d '' file; do
        # Skip the current cleanup log
        if [[ "$file" == "$LOG_FILE" ]]; then
            continue
        fi
        
        ((found++))
        if remove_safe "$file" "log_file"; then
            ((removed++))
        fi
    done < <(find "$PROJECT_ROOT" -name "*.log" -type f -print0 2>/dev/null || true)
    
    # Find log directories
    while IFS= read -r -d '' dir; do
        ((found++))
        if remove_safe "$dir" "log_directory"; then
            ((removed++))
        fi
    done < <(find "$PROJECT_ROOT" -name "logs" -type d -print0 2>/dev/null || true)
    
    log "INFO" "Log files: Found $found, Processed $removed"
}

# Clean up runtime temp files
cleanup_runtime() {
    log "INFO" "Cleaning up runtime temp files..."
    
    local temp_dirs=("tmp" "temp" "uploads" "sessions" "cache")
    local found=0
    local removed=0
    
    for dir_name in "${temp_dirs[@]}"; do
        while IFS= read -r -d '' dir; do
            ((found++))
            if remove_safe "$dir" "runtime_temp"; then
                ((removed++))
            fi
        done < <(find "$PROJECT_ROOT" -name "$dir_name" -type d -print0 2>/dev/null || true)
    done
    
    log "INFO" "Runtime temp files: Found $found, Processed $removed"
}

# Clean up system temp files
cleanup_system() {
    log "INFO" "Cleaning up system temp files..."
    
    local system_files=(".DS_Store" "Thumbs.db" "ehthumbs.db" ".Trashes" ".Spotlight-V100" "desktop.ini")
    local found=0
    local removed=0
    
    for file_name in "${system_files[@]}"; do
        while IFS= read -r -d '' file; do
            ((found++))
            if remove_safe "$file" "system_temp"; then
                ((removed++))
            fi
        done < <(find "$PROJECT_ROOT" -name "$file_name" -type f -print0 2>/dev/null || true)
    done
    
    log "INFO" "System temp files: Found $found, Processed $removed"
}

# Main cleanup function
run_cleanup() {
    local start_time=$(date +%s)
    
    log "INFO" "Starting cleanup session..."
    log "INFO" "Project root: $PROJECT_ROOT"
    log "INFO" "Dry run mode: $DRY_RUN"
    log "INFO" "Categories: ${CATEGORIES[*]}"
    log "INFO" "Log file: $LOG_FILE"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        echo -e "${RED}🚨 EXECUTE MODE: Files will be permanently removed!${NC}"
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "INFO" "Cleanup cancelled by user."
            exit 0
        fi
    else
        echo -e "${BLUE}🔍 DRY RUN MODE: No files will be removed, showing preview only${NC}"
    fi
    
    echo ""
    
    # Run cleanup for each category
    for category in "${CATEGORIES[@]}"; do
        echo "=================================================="
        echo "Processing category: ${category^^}"
        echo "=================================================="
        
        case "$category" in
            "test_files") cleanup_test_files ;;
            "cache")      cleanup_cache ;;
            "logs")       cleanup_logs ;;
            "runtime")    cleanup_runtime ;;
            "system")     cleanup_system ;;
            *)            log "WARN" "Unknown category: $category" ;;
        esac
        
        echo ""
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "=================================================="
    echo "CLEANUP SUMMARY"
    echo "=================================================="
    log "INFO" "Cleanup completed in ${duration}s"
    log "INFO" "Full log available at: $LOG_FILE"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}💡 This was a DRY RUN. Use --execute to actually remove files.${NC}"
    else
        echo -e "${GREEN}✅ Cleanup completed!${NC}"
    fi
}

# Verify script permissions and environment
verify_environment() {
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        log "ERROR" "Project root directory not found: $PROJECT_ROOT"
        exit 1
    fi
    
    if [[ ! -w "$PROJECT_ROOT" ]]; then
        log "ERROR" "No write permission for project root: $PROJECT_ROOT"
        exit 1
    fi
    
    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log "INFO" "Environment verification passed"
}

# Main execution
main() {
    parse_args "$@"
    verify_environment
    run_cleanup
}

# Execute main function with all arguments
main "$@"