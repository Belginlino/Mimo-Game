/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

declare global { var IS_REACT_ACT_ENVIRONMENT: boolean }

vi.mock('@react-three/fiber', () => ({ Canvas: () => <div role="img" aria-label="Locally rendered 3D avatar" />, useFrame: () => undefined }));
vi.mock('@react-three/drei', () => ({ Environment: () => null, OrbitControls: () => null }));

import { App } from '../App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('personal avatar flow', () => {
  let mount: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    mount = document.createElement('div');
    document.body.append(mount);
    root = createRoot(mount);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ image3d_provider_configured: false, image3d_provider: 'not_configured' }) }));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    mount.remove();
    vi.unstubAllGlobals();
  });

  it('opens directly into the local default human avatar with no startup setup modal', async () => {
    await act(async () => { root.render(<App />); await Promise.resolve(); });
    expect(mount.textContent).toContain('Default human avatar');
    expect(mount.querySelector('[role="dialog"]')).toBeNull();
    expect(mount.querySelector('[aria-label="Locally rendered 3D avatar"]')).toBeTruthy();
  });

  it('puts provider setup inside Edit / Customize > Face to 3D without uploading a photo', async () => {
    await act(async () => { root.render(<App />); await Promise.resolve(); });
    await act(async () => mount.querySelector<HTMLButtonElement>('[aria-label="Edit / Customize"]')?.click());
    const faceTo3d = [...mount.querySelectorAll('button')].find((button) => button.textContent?.includes('Face to 3D'));
    expect(faceTo3d).toBeTruthy();
    await act(async () => faceTo3d?.click());
    expect(mount.textContent).toContain('Face to 3D provider not configured');
    expect(mount.textContent).toContain('MESHY_API_KEY');
    expect(mount.textContent).not.toContain('Connect a human avatar provider');
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1);
  });

  it('clears an old photo-as-avatar value but keeps the default human room active', async () => {
    localStorage.setItem('mimo_avatar_model', 'blob:http://localhost/photo-preview');
    localStorage.setItem('mimo_avatar_job_id', 'old-local-sample');
    await act(async () => { root.render(<App />); await Promise.resolve(); });
    expect(mount.textContent).toContain('Default human avatar');
    expect(mount.textContent).toContain('Say anything.');
    expect(localStorage.getItem('mimo_avatar_model')).toBeNull();
  });
});
