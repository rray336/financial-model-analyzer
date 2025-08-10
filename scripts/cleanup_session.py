#!/usr/bin/env python3
"""
Financial Model Analyzer - Session Cleanup Script
Safely removes temporary files created during development and testing sessions.
"""

import os
import sys
import shutil
import glob
import json
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime

class SessionCleanup:
    """Handles safe removal of temporary files from development sessions."""
    
    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root) if project_root else Path(__file__).parent.parent
        self.dry_run = True  # Default to dry run for safety
        self.cleanup_log = []
        
    def set_dry_run(self, dry_run: bool):
        """Enable/disable dry run mode."""
        self.dry_run = dry_run
        
    def log_action(self, action: str, path: str, status: str = "pending"):
        """Log cleanup action for verification."""
        self.cleanup_log.append({
            "action": action,
            "path": path,
            "status": status,
            "timestamp": datetime.now().isoformat()
        })
        
    def get_temp_test_files(self) -> List[Path]:
        """Identify temporary and test files created for development."""
        temp_files = []
        
        # Known temporary test files (project-specific)
        test_files = [
            "frontend/src/components/upload/TestDropzone.tsx",
            "backend/test_period_api.py", 
            "backend/test_phase3_integration.py",
            "frontend/test_badge_logic.js",
            "frontend/src/components/upload/DebugUpload.tsx",
            "frontend/src/components/dashboard/TempExecutiveSummary.tsx"
        ]
        
        for file_path in test_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                temp_files.append(full_path)
                self.log_action("identify", str(full_path), "found")
                
        return temp_files
        
    def get_cache_files(self) -> List[Path]:
        """Identify cache and compiled files."""
        cache_patterns = [
            "**/__pycache__/**/*.pyc",
            "**/__pycache__/**/*.pyo", 
            "**/__pycache__/**/*.pyd",
            "**/.pytest_cache/**",
            "**/node_modules/.cache/**",
            "**/*.pyc",
            "**/*.pyo",
            "**/*.pyd"
        ]
        
        cache_files = []
        for pattern in cache_patterns:
            matches = self.project_root.glob(pattern)
            for match in matches:
                if match.is_file():
                    cache_files.append(match)
                    self.log_action("identify_cache", str(match), "found")
                    
        return cache_files
        
    def get_log_files(self) -> List[Path]:
        """Identify log files that can be safely removed."""
        log_patterns = [
            "**/*.log",
            "**/logs/**",
            "backend/server.log",
            "frontend/dev.log",
            "**/npm-debug.log*",
            "**/yarn-debug.log*", 
            "**/yarn-error.log*"
        ]
        
        log_files = []
        for pattern in log_patterns:
            matches = self.project_root.glob(pattern)
            for match in matches:
                if match.is_file():
                    log_files.append(match)
                    self.log_action("identify_log", str(match), "found")
                elif match.is_dir() and "logs" in match.name:
                    log_files.append(match)
                    self.log_action("identify_log_dir", str(match), "found")
                    
        return log_files
        
    def get_runtime_temp_files(self) -> List[Path]:
        """Identify runtime temporary files and directories."""
        temp_patterns = [
            "**/tmp/**",
            "**/temp/**", 
            "**/uploads/**",
            "**/sessions/**",
            "**/cache/**",
            "**/.coverage",
            "**/coverage/**",
            "**/test-results/**"
        ]
        
        temp_files = []
        for pattern in temp_patterns:
            matches = self.project_root.glob(pattern)
            for match in matches:
                if match.exists():
                    temp_files.append(match)
                    self.log_action("identify_runtime", str(match), "found")
                    
        return temp_files
        
    def get_system_temp_files(self) -> List[Path]:
        """Identify OS-generated temporary files."""
        system_patterns = [
            "**/.DS_Store",
            "**/Thumbs.db",
            "**/ehthumbs.db",
            "**/.Trashes",
            "**/.Spotlight-V100",
            "**/desktop.ini"
        ]
        
        system_files = []
        for pattern in system_patterns:
            matches = self.project_root.glob(pattern)
            for match in matches:
                if match.is_file():
                    system_files.append(match)
                    self.log_action("identify_system", str(match), "found")
                    
        return system_files
        
    def verify_file_safety(self, file_path: Path) -> Tuple[bool, str]:
        """Verify if a file is safe to remove."""
        # Protected files/directories - NEVER remove these
        protected_patterns = [
            "*.md", "*.txt", "*.json", "*.py", "*.tsx", "*.ts", "*.js",
            "**/src/**", "**/app/**", 
            "package.json", "requirements.txt", 
            ".gitignore", ".git/**",
            "README*", "LICENSE*"
        ]
        
        # Exception: Allow removal of specifically identified test files
        test_exceptions = [
            "TestDropzone.tsx", "test_period_api.py", "test_phase3_integration.py", 
            "test_badge_logic.js", "DebugUpload.tsx", "TempExecutiveSummary.tsx"
        ]
        
        file_name = file_path.name
        
        # Allow removal of test files even if they match protected patterns
        if file_name in test_exceptions:
            return True, "test_file_exception"
            
        # Check if file matches protected patterns
        for pattern in protected_patterns:
            if file_path.match(pattern):
                return False, f"protected_pattern: {pattern}"
                
        # Additional safety checks
        if file_path.is_dir():
            # Only allow removal of empty directories or known temp directories
            temp_dir_names = {"__pycache__", "cache", "tmp", "temp", "logs", "uploads", "sessions", ".pytest_cache"}
            if file_path.name in temp_dir_names:
                return True, "temp_directory"
            elif len(list(file_path.iterdir())) == 0:
                return True, "empty_directory"
            else:
                return False, "non_empty_directory"
                
        return True, "safe_file"
        
    def remove_file_safe(self, file_path: Path) -> bool:
        """Safely remove a file or directory."""
        try:
            is_safe, reason = self.verify_file_safety(file_path)
            
            if not is_safe:
                self.log_action("skip", str(file_path), f"unsafe: {reason}")
                return False
                
            if self.dry_run:
                self.log_action("dry_run", str(file_path), f"would_remove: {reason}")
                return True
                
            if file_path.is_dir():
                shutil.rmtree(file_path)
                self.log_action("remove_dir", str(file_path), "success")
            else:
                file_path.unlink()
                self.log_action("remove_file", str(file_path), "success")
                
            return True
            
        except Exception as e:
            self.log_action("error", str(file_path), f"failed: {str(e)}")
            return False
            
    def cleanup_session(self, categories: List[str] = None) -> Dict:
        """
        Main cleanup function.
        
        Args:
            categories: List of cleanup categories to run. 
                       Options: ['test_files', 'cache', 'logs', 'runtime', 'system']
                       Default: ['test_files', 'cache', 'logs']
        """
        if categories is None:
            categories = ['test_files', 'cache', 'logs']
            
        results = {
            "dry_run": self.dry_run,
            "categories_processed": categories,
            "summary": {},
            "details": self.cleanup_log
        }
        
        category_functions = {
            'test_files': self.get_temp_test_files,
            'cache': self.get_cache_files,
            'logs': self.get_log_files, 
            'runtime': self.get_runtime_temp_files,
            'system': self.get_system_temp_files
        }
        
        for category in categories:
            if category not in category_functions:
                print(f"Warning: Unknown category '{category}', skipping")
                continue
                
            print(f"\n{'='*50}")
            print(f"Processing category: {category.upper()}")
            print(f"{'='*50}")
            
            files = category_functions[category]()
            removed_count = 0
            skipped_count = 0
            error_count = 0
            
            for file_path in files:
                print(f"Processing: {file_path}")
                
                if self.remove_file_safe(file_path):
                    if self.dry_run:
                        print(f"  [DRY RUN] Would remove: {file_path}")
                    else:
                        print(f"  [REMOVED] {file_path}")
                    removed_count += 1
                else:
                    # Check if it was skipped for safety or had an error
                    last_log = self.cleanup_log[-1] if self.cleanup_log else {}
                    if "unsafe" in last_log.get("status", ""):
                        print(f"  [SKIPPED] {file_path} - {last_log['status']}")
                        skipped_count += 1
                    else:
                        print(f"  [ERROR] {file_path} - {last_log.get('status', 'unknown error')}")
                        error_count += 1
                        
            results["summary"][category] = {
                "files_found": len(files),
                "removed": removed_count,
                "skipped": skipped_count,
                "errors": error_count
            }
            
        return results
        
    def save_cleanup_report(self, results: Dict, report_path: str = None):
        """Save detailed cleanup report."""
        if report_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = self.project_root / f"cleanup_report_{timestamp}.json"
            
        with open(report_path, 'w') as f:
            json.dump(results, f, indent=2)
            
        print(f"\nCleanup report saved to: {report_path}")


def main():
    """Command line interface for cleanup script."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Clean up temporary files from Financial Model Analyzer development sessions")
    parser.add_argument("--dry-run", action="store_true", default=True, 
                       help="Run in dry-run mode (default, shows what would be removed)")
    parser.add_argument("--execute", action="store_true", 
                       help="Actually remove files (overrides --dry-run)")
    parser.add_argument("--categories", nargs="+", 
                       choices=['test_files', 'cache', 'logs', 'runtime', 'system'],
                       default=['test_files', 'cache', 'logs'],
                       help="Categories of files to clean up")
    parser.add_argument("--project-root", type=str,
                       help="Path to project root directory")
    parser.add_argument("--save-report", action="store_true",
                       help="Save detailed cleanup report")
    
    args = parser.parse_args()
    
    # Setup cleanup instance
    cleanup = SessionCleanup(args.project_root)
    
    # Set execution mode
    if args.execute:
        cleanup.set_dry_run(False)
        print("EXECUTE MODE: Files will be permanently removed!")
        response = input("Are you sure you want to continue? (yes/no): ")
        if response.lower() != "yes":
            print("Cleanup cancelled.")
            return
    else:
        cleanup.set_dry_run(True)
        print("DRY RUN MODE: No files will be removed, showing preview only")
        
    # Run cleanup
    print(f"\nStarting cleanup for categories: {', '.join(args.categories)}")
    print(f"Project root: {cleanup.project_root}")
    
    results = cleanup.cleanup_session(args.categories)
    
    # Display summary
    print(f"\n{'='*50}")
    print("CLEANUP SUMMARY")
    print(f"{'='*50}")
    
    total_found = sum(cat['files_found'] for cat in results['summary'].values())
    total_removed = sum(cat['removed'] for cat in results['summary'].values())
    total_skipped = sum(cat['skipped'] for cat in results['summary'].values())
    total_errors = sum(cat['errors'] for cat in results['summary'].values())
    
    for category, summary in results['summary'].items():
        print(f"{category.upper():12} | Found: {summary['files_found']:3d} | Removed: {summary['removed']:3d} | Skipped: {summary['skipped']:3d} | Errors: {summary['errors']:3d}")
        
    print(f"{'─'*50}")
    print(f"{'TOTAL':12} | Found: {total_found:3d} | Removed: {total_removed:3d} | Skipped: {total_skipped:3d} | Errors: {total_errors:3d}")
    
    if args.dry_run:
        print(f"\nThis was a DRY RUN. Use --execute to actually remove files.")
    else:
        print(f"\nCleanup completed!")
        
    # Save report if requested
    if args.save_report:
        cleanup.save_cleanup_report(results)


if __name__ == "__main__":
    main()