import { describe, it, expect, afterEach } from 'vitest';
import { deepQuery } from '../src/utils/deep-query';

describe('deepQuery', () => {
  const cleanup: Element[] = [];

  afterEach(() => {
    cleanup.forEach(el => el.remove());
    cleanup.length = 0;
  });

  function addToBody(el: Element) {
    document.body.appendChild(el);
    cleanup.push(el);
    return el;
  }

  it('finds an element in light DOM', () => {
    const el = addToBody(document.createElement('div'));
    el.setAttribute('data-tour-id', 'light-target');

    const found = deepQuery('[data-tour-id="light-target"]');
    expect(found).toBe(el);
  });

  it('returns null when no match exists', () => {
    const found = deepQuery('[data-tour-id="does-not-exist"]');
    expect(found).toBeNull();
  });

  it('searches from a custom root', () => {
    const container = addToBody(document.createElement('div'));
    const child = document.createElement('span');
    child.setAttribute('data-x', 'inner');
    container.appendChild(child);

    // Searching from container should find it
    const found = deepQuery('[data-x="inner"]', container);
    expect(found).toBe(child);
  });

  it('returns the first match found', () => {
    const first = addToBody(document.createElement('div'));
    first.classList.add('dup');
    const second = addToBody(document.createElement('div'));
    second.classList.add('dup');

    const found = deepQuery('.dup');
    expect(found).toBe(first);
  });
});
