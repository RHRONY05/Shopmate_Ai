import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JerseyCustomizerCanvas } from './JerseyCustomizerCanvas';

describe('JerseyCustomizerCanvas Component', () => {
  it('should render canvas element and invoke 2D drawing context', () => {
    const { container } = render(
      <JerseyCustomizerCanvas
        jerseyTitle="Arsenal 2019/20 Home"
        playerName="SAKA"
        playerNumber="7"
        hasSleeveBadge={true}
        sleeveBadgeName="Premier League Badge"
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.getContext).toHaveBeenCalledWith('2d');
  });

  it('renders official squad typography caption', () => {
    const { getByText } = render(
      <JerseyCustomizerCanvas
        jerseyTitle="Arsenal 2019/20 Home"
        playerName="SAKA"
        playerNumber="7"
        hasSleeveBadge={false}
        sleeveBadgeName=""
      />
    );

    expect(getByText(/Rendered live in official matchday squad font/i)).toBeInTheDocument();
  });
});
