require('dotenv').config();
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// Check for API key
if (!process.env.NOTION_API_KEY) {
  console.error('❌ Error: NOTION_API_KEY not found in environment variables');
  console.error('   Create a .env file with: NOTION_API_KEY=your_key_here');
  process.exit(1);
}

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

const DATABASE_ID = '2d616761a428807b9bbfc15737e61581';

// Fetch published posts from Notion
async function fetchPosts() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: 'Status',
      select: {
        equals: 'Published'
      }
    },
    sorts: [
      {
        property: 'Published Date',
        direction: 'descending'
      }
    ]
  });

  return response.results;
}

// Fetch page content (blocks)
async function fetchPageContent(pageId) {
  const blocks = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor
    });

    blocks.push(...response.results);

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return blocks;
}

// Convert Notion blocks to HTML
function blocksToHtml(blocks) {
  return blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        const text = richTextToHtml(block.paragraph.rich_text)
          .replace(/^(<br>)+|(<br>)+$/g, ''); // Trim leading/trailing <br> tags
        return text ? `<p>${text}</p>` : '';

      case 'heading_1':
        return `<h1>${richTextToHtml(block.heading_1.rich_text)}</h1>`;

      case 'heading_2':
        return `<h2>${richTextToHtml(block.heading_2.rich_text)}</h2>`;

      case 'heading_3':
        return `<h3>${richTextToHtml(block.heading_3.rich_text)}</h3>`;

      case 'bulleted_list_item':
        return `<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`;

      case 'numbered_list_item':
        return `<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`;

      case 'quote':
        return `<blockquote>${richTextToHtml(block.quote.rich_text)}</blockquote>`;

      case 'code':
        return `<pre><code>${richTextToHtml(block.code.rich_text)}</code></pre>`;

      case 'divider':
        return '<hr>';

      case 'image':
        const imageUrl = block.image.type === 'external' 
          ? block.image.external.url 
          : block.image.file.url;
        const caption = block.image.caption?.length 
          ? richTextToHtml(block.image.caption) 
          : '';
        return `<figure><img src="${imageUrl}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`;

      default:
        return '';
    }
  }).filter(html => html !== '').join('\n\n                    ');
}

// Convert Notion rich text to HTML
function richTextToHtml(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return '';

  return richTextArray.map(text => {
    // Escape HTML and convert newlines to <br>
    let content = text.plain_text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    // Apply annotations
    if (text.annotations.bold) content = `<strong>${content}</strong>`;
    if (text.annotations.italic) content = `<em>${content}</em>`;
    if (text.annotations.strikethrough) content = `<del>${content}</del>`;
    if (text.annotations.underline) content = `<u>${content}</u>`;
    if (text.annotations.code) content = `<code>${content}</code>`;

    // Apply links
    if (text.href) content = `<a href="${text.href}">${content}</a>`;

    return content;
  }).join('');
}

// Get page properties
function getPageProperties(page) {
  const title = page.properties.Title?.title?.[0]?.plain_text || 'Untitled';
  const date = page.properties['Published Date']?.date?.start || new Date().toISOString().split('T')[0];
  const slug = slugify(title);

  return { title, date, slug };
}

// Create URL-friendly slug
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format date for post list (short format)
function formatDateShort(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

// Generate HTML for a single post
function generatePostHtml(title, date, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Khiet Tran</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="stylesheet" href="../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="header">
            <nav class="nav">
                <a href="../index.html" class="nav-link">Home</a>
                <a href="index.html" class="nav-link">Thoughts</a>
                <a href="../contact.html" class="nav-link">Contact</a>
            </nav>
        </header>

        <main class="main">
            <article class="blog-post">
                <div class="post-header">
                    <h1 class="post-title-full">${title}</h1>
                    <p class="post-meta-full">${formatDate(date)}</p>
                </div>

                <div class="post-content">
                    ${content}
                </div>

                <div class="post-footer">
                    <a href="index.html" class="back-link">← Back to Thoughts</a>
                </div>
            </article>
        </main>

        <footer class="footer">
            <div class="social-links">
                <a href="https://www.linkedin.com/in/khiet-tran/" class="social-link" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </a>
            </div>
            <p class="copyright">© 2025 Khiet Tran. All rights reserved.</p>
        </footer>
    </div>

    <script src="../script.js"></script>
</body>
</html>
`;
}

// Generate the thoughts index page
function generateIndexHtml(posts) {
  // Group posts by year
  const postsByYear = {};
  posts.forEach(post => {
    const year = new Date(post.date).getFullYear();
    if (!postsByYear[year]) postsByYear[year] = [];
    postsByYear[year].push(post);
  });

  // Generate year groups HTML
  const yearGroupsHtml = Object.keys(postsByYear)
    .sort((a, b) => b - a) // Sort years descending
    .map(year => {
      const postsHtml = postsByYear[year]
        .map(post => `                        <li class="post-list-item">
                            <time class="post-date">${formatDateShort(post.date)}</time>
                            <a href="${post.slug}.html" class="post-list-link">${post.title}</a>
                        </li>`)
        .join('\n');

      return `                <div class="year-group">
                    <h2 class="year-heading">${year}</h2>
                    <ul class="posts-list">
${postsHtml}
                    </ul>
                </div>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thoughts - Khiet Tran</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="stylesheet" href="../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header class="header">
            <nav class="nav">
                <a href="../index.html" class="nav-link">Home</a>
                <a href="index.html" class="nav-link">Thoughts</a>
                <a href="../contact.html" class="nav-link">Contact</a>
            </nav>
        </header>

        <main class="main">
            <section class="hero">
                <h1 class="hero-title">Thoughts</h1>
                
                <div class="hero-content">
                    <p class="hero-text">
                    </p>
                </div>
            </section>

            <section class="posts-section">
${yearGroupsHtml}
            </section>
        </main>

        <footer class="footer">
            <div class="social-links">
                <a href="https://www.linkedin.com/in/khiet-tran/" class="social-link" target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </a>
            </div>
            <p class="copyright">© 2025 Khiet Tran. All rights reserved.</p>
        </footer>
    </div>

    <script src="../script.js"></script>
</body>
</html>
`;
}

// Main function
async function main() {
  console.log('🔄 Fetching posts from Notion...');

  try {
    const pages = await fetchPosts();
    console.log(`📝 Found ${pages.length} posts`);

    const posts = [];
    const thoughtsDir = path.join(__dirname, 'thoughts');

    // Process each post
    for (const page of pages) {
      const { title, date, slug } = getPageProperties(page);
      console.log(`  → Processing: ${title}`);

      // Fetch and convert content
      const blocks = await fetchPageContent(page.id);
      const htmlContent = blocksToHtml(blocks);

      // Generate and write post HTML
      const postHtml = generatePostHtml(title, date, htmlContent);
      fs.writeFileSync(path.join(thoughtsDir, `${slug}.html`), postHtml);

      posts.push({ title, date, slug });
    }

    // Generate and write index page
    const indexHtml = generateIndexHtml(posts);
    fs.writeFileSync(path.join(thoughtsDir, 'index.html'), indexHtml);

    console.log('✅ Successfully generated all posts!');
    console.log(`   ${posts.length} posts written to /thoughts/`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
