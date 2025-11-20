import { useState, useEffect } from 'react';

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  description: string;
  content: string; // The "dox" content
  image?: string;
  comments: Comment[];
}

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'SCAMMER_ALERT: John_Doe_1992',
    author: 'Admin',
    date: '2023-11-19',
    views: 12450,
    description: 'Confirmed scammer operating in crypto spaces. Full details attached.',
    content: `
[TARGET INFORMATION]
NAME: John Doe
DOB: 1992-04-15
LOCATION: New York, NY
KNOWN ALIASES: J_Doe, CryptoKing92

[INCIDENT REPORT]
Subject has been soliciting funds for non-existent projects. 
Evidence of multiple rug pulls across ETH and SOL chains.
Wallet addresses linked to known laundering services.

[EVIDENCE]
- Screenshot_01.png (Attached)
- Chat_Logs.txt
    `,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
    comments: [
      { id: 'c1', author: 'AnonUser', text: 'Can confirm, lost 2 ETH to this guy.', date: '2023-11-19 14:20' },
      { id: 'c2', author: 'SecurityWatch', text: 'Adding to our blacklist.', date: '2023-11-20 09:15' }
    ]
  },
  {
    id: '2',
    title: 'MALWARE_ANALYSIS: RedLine_Stealer_Variant_X',
    author: 'Admin',
    date: '2023-11-18',
    views: 8902,
    description: 'Technical breakdown of the new RedLine variant spreading via Discord.',
    content: `
[THREAT INTELLIGENCE]
TYPE: Trojan / InfoStealer
FAMILY: RedLine
SPREAD: Discord Nitro Phishing

[TECHNICAL DETAILS]
The malware drops a payload in %TEMP% and establishes persistence via Registry Run keys.
Exfiltrates browser cookies, saved passwords, and crypto wallet.dat files.

[IOCs]
Hash: 8a2f...9b1c
C2: 192.168.X.X (Sanitized)
    `,
    comments: []
  },
  {
    id: '3',
    title: 'DATABASE_LEAK: MockCorp_User_Table',
    author: 'Admin',
    date: '2023-11-15',
    views: 45200,
    description: 'Educational analysis of SQL injection vulnerability leading to data leak.',
    content: `
[VULNERABILITY REPORT]
TARGET: MockCorp (Educational Target)
VULN: SQL Injection (Time-based Blind)

[METHODOLOGY]
Parameter 'id' in the search endpoint was not sanitized.
payload: ' OR SLEEP(5)--

[LESSON]
Always use prepared statements. 
Sanitize all user inputs.
    `,
    comments: [
      { id: 'c3', author: 'Student1', text: 'Great writeup, very clear.', date: '2023-11-16' }
    ]
  }
];

// Initialize posts from local storage if available, otherwise use mock
let posts: Post[] = [];

try {
    const stored = localStorage.getItem('doxdb_posts');
    if (stored) {
        posts = JSON.parse(stored);
    } else {
        posts = [...MOCK_POSTS];
        localStorage.setItem('doxdb_posts', JSON.stringify(posts));
    }
} catch (e) {
    posts = [...MOCK_POSTS];
}

let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach(l => l());
  // Persist on every change
  localStorage.setItem('doxdb_posts', JSON.stringify(posts));
}

export const store = {
  getPosts: () => posts,
  getPost: (id: string) => posts.find(p => p.id === id),
  addComment: (postId: string, text: string, author: string) => {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        author,
        date: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      const updatedPost = { ...posts[postIndex], comments: [...posts[postIndex].comments, newComment] };
      posts = [...posts.slice(0, postIndex), updatedPost, ...posts.slice(postIndex + 1)];
      notify();
    }
  },
  addPost: (postData: {title: string, description: string, content: string, image?: string, author: string}) => {
    const newPost: Post = {
        id: Math.random().toString(36).substr(2, 9),
        title: postData.title,
        author: postData.author,
        date: new Date().toISOString().split('T')[0],
        views: 0,
        description: postData.description,
        content: postData.content,
        image: postData.image,
        comments: []
    };
    posts = [newPost, ...posts];
    notify();
  },
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  incrementView: (postId: string) => {
     const postIndex = posts.findIndex(p => p.id === postId);
     if (postIndex > -1) {
       posts[postIndex].views += 1;
       notify();
     }
  }
};
