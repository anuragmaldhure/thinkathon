"""
Script to add authentication guards to all HTML files in the three app folders.
"""
import os
import re
from pathlib import Path

# Define the folders to process
FOLDERS = [
    'apps/system_administrator',
    'apps/team_lead',
    'apps/employee'
]

# Files to skip
SKIP_FILES = ['auth.html']

def add_auth_guard_to_file(file_path):
    """Add authentication guard to an HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if auth guard already exists
        if 'Auth Guard - Check authentication before initializing page' in content:
            print(f"  ✓ Already has auth guard: {file_path}")
            return False
        
        # Find the first <script type="module"> tag
        pattern = r'(<script type="module"[^>]*>\s*)(import\s+{[^}]+}\s+from\s+["\'][^"\']+["\'];?\s*(?:import\s+{[^}]+}\s+from\s+["\'][^"\']+["\'];?\s*)*)'
        
        match = re.search(pattern, content, re.MULTILINE | re.DOTALL)
        if not match:
            print(f"  ✗ No script module tag found: {file_path}")
            return False
        
        # Get the imports
        imports_section = match.group(2)
        
        # Create the auth guard code
        auth_guard = '''
        // Auth Guard - Check authentication before initializing page
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = 'auth.html';
                return;
            }
            // User is authenticated, proceed with page initialization
            initializePage();
        });

        // Wrap existing initialization code in this function
        function initializePage() {'''
        
        # Insert auth guard after imports
        replacement = match.group(1) + imports_section + auth_guard
        new_content = content.replace(match.group(0), replacement, 1)
        
        # Find the end of the first script tag to close initializePage
        # Look for the closing </script> tag
        script_end_pattern = r'(\s*)(</script>)'
        
        # Find the first occurrence after our insertion point
        match_pos = new_content.find(replacement) + len(replacement)
        remaining_content = new_content[match_pos:]
        
        # Find where to close initializePage
        # Look for the closing script tag in the remaining content
        script_end_match = re.search(script_end_pattern, remaining_content)
        
        if script_end_match:
            # Add closing brace before </script>
            close_init = '\n        } // End initializePage\n'
            replacement_end = script_end_match.group(1) + close_init + script_end_match.group(2)
            new_content = new_content[:match_pos] + remaining_content.replace(script_end_match.group(0), replacement_end, 1)
        
        # Also remove any duplicate onAuthStateChanged calls in the same script
        # (Keep our new one, remove old ones)
        # This is a bit tricky, so let's do it carefully
        # Look for patterns like:
        # onAuthStateChanged(auth, async (user) => {
        #     if (!user) {
        #         window.location.href = 'auth.html';
        #         return;
        #     }
        #     ...
        # });
        
        # Count how many onAuthStateChanged we have
        auth_state_count = new_content.count('onAuthStateChanged(auth,')
        
        if auth_state_count > 1:
            # We have duplicates. Let's remove the old one(s) that just redirect
            # Find the duplicate in the initializePage function
            init_section_start = new_content.find('function initializePage() {')
            if init_section_start > 0:
                init_section_end = new_content.find('} // End initializePage', init_section_start)
                if init_section_end > 0:
                    init_section = new_content[init_section_start:init_section_end]
                    
                    # Remove onAuthStateChanged that only does redirect and user profile loading
                    # This is the duplicate we want to remove
                    duplicate_pattern = r'\s*//\s*Auth\s+state\s+management\s*\n\s*onAuthStateChanged\(auth,\s*async\s*\(user\)\s*=>\s*{[^}]+if\s*\(!user\)\s*{[^}]+window\.location\.href\s*=\s*["\']auth\.html["\'];[^}]+return;[^}]+}[^}]+//\s*Load\s+user\s+profile\s+data[^}]+try\s*{[^}]+}\s*catch[^}]+}[^}]+}\);'
                    
                    init_section_cleaned = re.sub(duplicate_pattern, '', init_section, flags=re.DOTALL)
                    
                    # If that didn't work, try a simpler pattern
                    if init_section_cleaned == init_section:
                        # Try to find and remove the simpler redirect-only pattern
                        simpler_pattern = r'\s*onAuthStateChanged\(auth,\s*(?:async\s*)?\(?user\)?\s*=>\s*\{[^}]*if\s*\(!user\)\s*\{[^}]*window\.location\.href\s*=\s*["\']auth\.html["\'];[^}]*return;[^}]*\}[^\}]*\}\);'
                        init_section_cleaned = re.sub(simpler_pattern, '', init_section, flags=re.DOTALL)
                    
                    # Reconstruct the content
                    if init_section_cleaned != init_section:
                        new_content = new_content[:init_section_start] + init_section_cleaned + new_content[init_section_end:]
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✓ Added auth guard: {file_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all HTML files."""
    base_dir = Path(__file__).parent
    
    print("Adding authentication guards to HTML files...\n")
    
    total_files = 0
    processed_files = 0
    
    for folder in FOLDERS:
        folder_path = base_dir / folder
        print(f"Processing folder: {folder}")
        
        if not folder_path.exists():
            print(f"  ✗ Folder not found: {folder_path}")
            continue
        
        # Get all HTML files in the folder
        html_files = list(folder_path.glob('*.html'))
        
        for html_file in html_files:
            # Skip auth.html files
            if html_file.name in SKIP_FILES:
                print(f"  ⊘ Skipped: {html_file}")
                continue
            
            total_files += 1
            if add_auth_guard_to_file(html_file):
                processed_files += 1
        
        print()
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total files checked: {total_files}")
    print(f"  Files modified: {processed_files}")
    print(f"  Files skipped: {total_files - processed_files}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
