import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LegalDocProps {
    title: string;
    /** Filename only (e.g. CGU.md). File must be in project root /content folder for deployment. */
    filePath: string;
}

export default function LegalDocument({ title, filePath }: LegalDocProps) {
    let content = '';
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), 'content', filePath);
    try {
        content = fs.readFileSync(resolvedPath, 'utf8');
    } catch (err) {
        console.error(`Error reading ${resolvedPath}:`, err);
        content = `# Erreur\nImpossible de charger le document: ${title}`;
    }

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 24px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }} {...props} />,
                    h2: ({ node, ...props }) => <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '32px 0 16px', color: '#1e293b' }} {...props} />,
                    h3: ({ node, ...props }) => <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 12px', color: '#334155' }} {...props} />,
                    p: ({ node, ...props }) => <p style={{ fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px', color: '#475569' }} {...props} />,
                    ul: ({ node, ...props }) => <ul style={{ margin: '0 0 16px 24px', listStyleType: 'disc', color: '#475569' }} {...props} />,
                    ol: ({ node, ...props }) => <ol style={{ margin: '0 0 16px 24px', listStyleType: 'decimal', color: '#475569' }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ marginBottom: '8px', lineHeight: '1.6' }} {...props} />,
                    table: ({ node, ...props }) => <div style={{ overflowX: 'auto', margin: '24px 0' }}><table style={{ width: '100%', borderCollapse: 'collapse' }} {...props} /></div>,
                    th: ({ node, ...props }) => <th style={{ border: '1px solid #e2e8f0', padding: '12px 16px', background: '#f8fafc', textAlign: 'left', fontWeight: '600', color: '#334155' }} {...props} />,
                    td: ({ node, ...props }) => <td style={{ border: '1px solid #e2e8f0', padding: '12px 16px', color: '#475569', fontSize: '14px' }} {...props} />,
                    a: ({ node, ...props }) => <a style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }} {...props} />,
                    strong: ({ node, ...props }) => <strong style={{ color: '#0f172a', fontWeight: '700' }} {...props} />,
                    hr: ({ node, ...props }) => <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote style={{ margin: '24px 0', padding: '16px 24px', background: '#f8fafc', borderLeft: '4px solid #3b82f6', color: '#334155', fontStyle: 'italic', borderRadius: '0 8px 8px 0' }} {...props} />
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
