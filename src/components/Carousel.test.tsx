import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PITCH_SLIDES } from '../features/site/pitchSlides';
import { Carousel } from './Carousel';

describe('Carousel', () => {
  it('shows every slide with alt text and a counter', () => {
    render(<Carousel label="Pitch slides" slides={PITCH_SLIDES} width={1280} height={720} />);
    expect(screen.getAllByRole('img')).toHaveLength(14);
    expect(screen.getByAltText(/^Slide 1\. Group 12/)).toBeInTheDocument();
    expect(screen.getByText('1 / 14')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  });

  it('moves with the buttons and the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Carousel label="Pitch slides" slides={PITCH_SLIDES} width={1280} height={720} />);
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByText('2 / 14')).toBeInTheDocument();
    const track = screen.getByLabelText(/use the arrow keys/);
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    expect(screen.getByText('3 / 14')).toBeInTheDocument();
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 14')).toBeInTheDocument();
  });

  it('never links to Canva', () => {
    expect(PITCH_SLIDES.every((s) => s.src.startsWith('/images/pitch/'))).toBe(true);
  });
});
