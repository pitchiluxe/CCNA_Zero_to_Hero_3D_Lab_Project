import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export function PortfolioLab() {
  const [markdown, setMarkdown] = useState(`# CCNA Lab Portfolio

## Overview
Document your CCNA Zero-to-Hero journey here. Include:

- Completed labs and phase reports
- Subnetting drill scores
- Troubleshooting case notes
- Network design projects

## Skills
- VLANs and 802.1Q trunking
- OSPF and static routing
- DHCP, DNS, NAT, and ACLs
- Switch security and wireless basics
- Packet analysis with Wireshark
`);

  const copy = () => {
    navigator.clipboard.writeText(markdown);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold">GitHub Portfolio Generator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Edit the portfolio markdown and copy it for a GitHub README.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Markdown Editor</h3>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={18}
            className="w-full rounded border border-slate-200 bg-slate-50 p-2 font-mono text-sm dark:border-net-700 dark:bg-net-900"
          />
          <Button onClick={copy} className="mt-3">Copy to clipboard</Button>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Preview</h3>
          <div className="prose max-w-none rounded border border-slate-200 p-3 text-sm dark:border-net-700">
            {markdown.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold">{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold">{line.slice(3)}</h2>;
              if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
