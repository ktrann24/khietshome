# Personal Landing Page

A beautiful, minimalist personal landing page inspired by [leerob.com](https://leerob.com/).

## Features

- 🎨 Clean, minimalist design
- 🌓 Automatic dark mode support (respects system preferences)
- 📱 Fully responsive layout
- ✨ Smooth animations and transitions
- 🎯 SEO-friendly
- ⚡ Fast and lightweight
- 🎭 Accessible

## Getting Started

1. Open `index.html` in your browser to view the site locally
2. Customize the content in `index.html`:
   - Update your name, bio, and work history
   - Change the favorite essays/articles
   - Update social media links
   - Modify the "currently listening to" section

## Customization

### Personal Information

Edit the hero section in `index.html`:
```html
<h1 class="hero-title">Your Name</h1>
<p class="hero-text">
    I'm a developer and creator...
</p>
```

### Favorite Essays

Modify the list in the favorites section:
```html
<li class="favorite-item">
    <a href="#" class="favorite-link">
        <span class="favorite-icon">→</span>
        Your Essay Title
    </a>
</li>
```

### Social Links

Update the footer social links with your profiles:
```html
<a href="https://twitter.com/yourusername" class="social-link">
```

### Color Scheme

Customize colors in `styles.css` by modifying the CSS variables:
```css
:root {
    --bg-primary: #ffffff;
    --text-primary: #111827;
    --accent-color: #2563eb;
    /* ... more variables */
}
```

## Technology Stack

- Pure HTML5
- CSS3 with custom properties
- Vanilla JavaScript
- Google Fonts (Inter)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- No external dependencies (except Google Fonts)
- Minimal JavaScript
- Optimized animations
- Fast loading time

## Deployment

You can deploy this site to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting service

Simply upload the files and you're good to go!

## License

Feel free to use this template for your personal website.

## Inspiration

Design inspired by [Lee Robinson's website](https://leerob.com/).

