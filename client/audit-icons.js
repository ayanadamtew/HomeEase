const fs = require('fs');
const path = require('path');

const files = [
  'src/app/page.js',
  'src/components/Navbar.js',
  'src/components/Footer.js',
  'src/app/properties/page.js',
  'src/app/properties/[id]/page.js',
  'src/components/PropertyCard.js',
  'src/app/services/page.js',
  'src/app/services/[id]/page.js',
  'src/app/auth/login/page.js',
  'src/app/auth/register/page.js',
  'src/app/dashboard/page.js',
  'src/app/dashboard/add-property/page.js',
  'src/app/dashboard/provider-profile/page.js',
  'src/app/messages/page.js'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Find icons used in JSX: <IconName ... />
  const usedIcons = new Set();
  const jsxMatch = content.match(/<([A-Z][A-Za-z0-9]+)/g);
  if (jsxMatch) {
    jsxMatch.forEach(m => {
      const name = m.substring(1);
      // Filter out common non-icon components
      if (!['Link', 'PropertyCard', 'AuthContext', 'RoleCard', 'NavLink', 'MobileLink', 'MetricCard', 'RoleQuickCards', 'Stat', 'SectionBox', 'Field', 'AmenityToggle'].includes(name)) {
        usedIcons.add(name);
      }
    });
  }

  // Find icons used in objects/props: { icon: <IconName /> } or icon={<IconName />}
  const objMatch = content.match(/icon[:=]\s*<([A-Z][A-Za-z0-9]+)/g);
  if (objMatch) {
    objMatch.forEach(m => {
      const name = m.split('<')[1];
      if (!['Link', 'PropertyCard', 'AuthContext', 'RoleCard', 'NavLink', 'MobileLink', 'MetricCard', 'RoleQuickCards', 'Stat', 'SectionBox', 'Field', 'AmenityToggle'].includes(name)) {
        usedIcons.add(name);
      }
    });
  }
  
  // Find icons in amenityIcons object
  const amenityMatch = content.match(/<([A-Z][A-Za-z0-9]+)\s*className/g);
  if (amenityMatch) {
      amenityMatch.forEach(m => {
          const name = m.substring(1).split(' ')[0];
          if (!['Link', 'PropertyCard', 'AuthContext', 'RoleCard', 'NavLink', 'MobileLink', 'MetricCard', 'RoleQuickCards', 'Stat', 'SectionBox', 'Field', 'AmenityToggle'].includes(name)) {
            usedIcons.add(name);
          }
      })
  }

  // Get lucide-react imports
  const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*'lucide-react'/);
  const imports = importMatch ? importMatch[1].split(',').map(s => s.trim()) : [];
  
  const missing = [];
  usedIcons.forEach(icon => {
    if (!imports.includes(icon) && !content.includes(`function ${icon}`) && !content.includes(`const ${icon} =`)) {
        // Also check if it's imported from elsewhere (like Lucide renamed imports)
        if (!content.includes(`as ${icon}`)) {
            missing.push(icon);
        }
    }
  });

  if (missing.length > 0) {
    console.log(`File: ${file}`);
    console.log(`Used but not imported: ${missing.join(', ')}`);
    console.log('---');
  }
});
