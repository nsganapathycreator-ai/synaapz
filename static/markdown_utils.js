// markdown_utils.js - Utility functions for markdown processing

function markdownToHtml(text) {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\n/g, '<br>');
    return html;
}

function htmlToMarkdown(html) {
    if (!html) return '';
    return html
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<code>(.*?)<\/code>/gi, '`$1`')
        .replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}
