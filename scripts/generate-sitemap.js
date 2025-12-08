import { readdir } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';

/**
 * Recursively finds all +page.md and +page.svelte files in the routes directory
 */
async function findRouteFiles(dir, baseDir = dir) {
    const routes = [];
    
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively search subdirectories
                const subRoutes = await findRouteFiles(fullPath, baseDir);
                routes.push(...subRoutes);
            } else if (entry.isFile() && entry.name.match(/^\+page\.(md|svelte)$/)) {
                // Convert file path to URL path
                const relativePath = fullPath.replace(baseDir, '');
                let urlPath = relativePath
                    .replace(/\\/g, '/') // Windows path separator
                    .replace(/\/\+page\.(md|svelte)$/, '') // Remove +page.md/svelte
                    .replace(/\/\([^)]+\)/g, '') // Remove SvelteKit route groups (parenthesized folders)
                    .replace(/\/$/, '') || '/'; // Handle root, remove trailing slash
                
                // Filter out unwanted routes
                if (!urlPath.includes('[') && !urlPath.includes('sitemap')) {
                    routes.push(urlPath);
                }
            }
        }
    } catch (error) {
        console.warn(`Could not read directory ${dir}:`, error.message);
    }
    
    return routes;
}

/**
 * Generates XML sitemap content
 */
function generateSitemap(routes, baseUrl = 'https://svelte-router.dev') {
    const lastModified = new Date().toISOString();
    
    const urlEntries = routes
        .sort()
        .map(route => {
            const priority = route === '/' ? '1.0' : '0.8';
            return `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
        })
        .join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Main function to generate sitemap
 */
async function main() {
    const routesDir = resolve('src/routes');
    const buildDir = resolve('build');
    const sitemapPath = join(buildDir, 'sitemap.xml');
    
    console.log('🗺️  Generating sitemap...');
    
    try {
        // Find all route files
        const routes = await findRouteFiles(routesDir);
        console.log(`Found ${routes.length} routes:`, routes);
        
        // Generate sitemap XML
        const sitemapXml = generateSitemap(routes);
        
        // Write to build directory
        await writeFile(sitemapPath, sitemapXml, 'utf8');
        
        console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

main();