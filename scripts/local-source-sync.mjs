import { LOCAL_SOURCE_SYNC_SCRIPT } from '../src/platform/workspace/local-source-tool.mjs';
await import('data:text/javascript;base64,'+Buffer.from(LOCAL_SOURCE_SYNC_SCRIPT).toString('base64'));
