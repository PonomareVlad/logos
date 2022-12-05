import {writeFileSync, readFileSync} from "fs";

const {logos, tags} = JSON.parse(readFileSync('../svgporn.json').toString());

const excluded = ['developers'];

const segments = [
    'cli',
    'php',
    'IDE',
    'css',
    'cms',
    'java',
    'ruby',
    'react',
    'python',
    'mobile',
    'node.js',
    'graphql',
    'library',
    'database',
    'language',
    'jetbrains',
    'reference',
    'javascript',
    'web hosting',
    'code editor',
    'code review',
    'cross-platform',
    'version control',
    'static site generator',
    'continuous integration',
];

const joins = {
    'geeks': [
        'hackers'
    ],
    'IDE': [
        'cli',
        'jetbrains',
        'code editor',
        'code review',
        'version control',
        'continuous integration'
    ],
    'services': [
        'web hosting',
        'publishers',
        'reference',
        'bloggers',
        'sharing',
        'teams'
    ],
    'backend': [
        'cms',
        'php',
        'java',
        'ruby',
        'python',
        'node.js',
        'graphql',
        'database',
        'language'
    ],
    'frontend': [
        'css',
        'react',
        'mobile',
        'library',
        'javascript',
        'cross-platform',
        'static site generator'
    ],
}

const groups = {};

logos.forEach((logo = {}) => {
    let {categories = [], files = []} = logo;
    files = files.map(file => file.replace('.svg', '.tgs'));
    if (files.length > 1) files = files.filter(file => file.endsWith('-icon.tgs') || file.endsWith('-icon-alt.tgs'));
    const category = categories.filter(category => !excluded.includes(category)).pop() || categories.pop() || 'other';
    if (!groups[category]) groups[category] = [];
    groups[category].push({...logo, files});
})

excluded.forEach(key => groups[key] = groups[key].filter((logo = {}) => {
    const {tags = []} = logo;
    const segment = segments.find(segment => tags.includes(segment));
    if (!segment) return true;
    if (!groups[segment]) groups[segment] = [];
    groups[segment].push(logo);
}))

Object.entries(joins).forEach(([parent, childs = []]) => childs.forEach(child => {
    if (!groups[child] || !Array.isArray(groups[child])) return;
    if (!groups[parent]) groups[parent] = [];
    groups[parent] = [...groups[parent], ...groups[child]];
    delete groups[child];
}))

Object.entries(groups).forEach(([key, group]) => groups[key] = group.flatMap(({files = []}) => files));

const stats = Object.fromEntries(Object.entries(groups).map(([group, items]) => [group, items.length]).sort(([, a], [, b]) => b - a))

writeFileSync('../groups.json', JSON.stringify(groups));

console.debug(stats);
