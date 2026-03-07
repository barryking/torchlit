import { afterEach, describe, expect, it } from 'vitest';
import { deepQuery } from '../src/dom/deep-query';

describe('deepQuery', () => {
  const cleanup: Element[] = [];

  afterEach(() => {
    cleanup.forEach(element => element.remove());
    cleanup.length = 0;
  });

  function addToBody(element: Element) {
    document.body.appendChild(element);
    cleanup.push(element);
    return element;
  }

  it('finds an element in light DOM', () => {
    const element = addToBody(document.createElement('div'));
    element.setAttribute('data-tour-id', 'light-target');

    expect(deepQuery('[data-tour-id="light-target"]')).toBe(element);
  });

  it('searches through nested open shadow roots', () => {
    const host = addToBody(document.createElement('div'));
    const outerShadow = host.attachShadow({ mode: 'open' });
    const nestedHost = document.createElement('div');
    outerShadow.appendChild(nestedHost);
    const innerShadow = nestedHost.attachShadow({ mode: 'open' });
    const target = document.createElement('button');
    target.setAttribute('data-tour-id', 'deep-shadow');
    innerShadow.appendChild(target);

    expect(deepQuery('[data-tour-id="deep-shadow"]')).toBe(target);
  });

  it('prefers a light DOM match over a later shadow DOM match', () => {
    const light = addToBody(document.createElement('div'));
    light.className = 'shared';

    const host = addToBody(document.createElement('div'));
    const shadow = host.attachShadow({ mode: 'open' });
    const shadowMatch = document.createElement('div');
    shadowMatch.className = 'shared';
    shadow.appendChild(shadowMatch);

    expect(deepQuery('.shared')).toBe(light);
  });

  it('returns null for closed shadow roots', () => {
    const host = addToBody(document.createElement('div'));
    host.attachShadow({ mode: 'closed' });

    expect(deepQuery('[data-tour-id="closed-target"]')).toBeNull();
  });
});
