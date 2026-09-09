import appPackage from '../../package.json';
import rootPackage from '../../../package.json';

describe('package version', () => {
  it('keeps the application and release metadata in sync', () => {
    expect(appPackage.version).toBe(rootPackage.version);
  });
});
