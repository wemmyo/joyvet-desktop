// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';

import { TableEmptyRow, TableFrame } from '../table-helpers';

describe('table helpers', () => {
  it('renders a framed container around children', () => {
    const { container } = render(
      <TableFrame>
        <div>Table content</div>
      </TableFrame>
    );

    expect(container.firstElementChild?.className).toContain('rounded-md');
    expect(container.firstElementChild?.className).toContain('border');
    expect(screen.getByText('Table content')).toBeTruthy();
  });

  it('renders a full-width empty row message', () => {
    render(
      <table>
        <tbody>
          <TableEmptyRow colSpan={4} message="Nothing to show" />
        </tbody>
      </table>
    );

    const cell = screen.getByText('Nothing to show').closest('td');

    expect(cell?.getAttribute('colspan')).toBe('4');
  });
});
