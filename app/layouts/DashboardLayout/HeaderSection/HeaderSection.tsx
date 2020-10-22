import * as React from 'react';
import { Input, Button, Icon } from 'semantic-ui-react';
import styles from './HeaderSection.css';

export interface HeaderSectionProps {
  screenTitle: string;
  openRightSidebarFn: () => void;
}

const HeaderSection: React.SFC<HeaderSectionProps> = ({
  screenTitle,
  openRightSidebarFn,
}) => {
  return (
    <header className={styles.headerSection}>
      <h2 className={styles.headerSection__title}>{screenTitle}</h2>
      <div className={styles.headerSection__left}>
        <Button icon labelPosition="left">
          <Icon name="filter" />
          Filter
        </Button>
        <Button
          color="blue"
          icon
          labelPosition="left"
          onClick={() => openRightSidebarFn()}
        >
          <Icon inverted color="grey" name="add" />
          Create
        </Button>

        <Input icon="search" placeholder="Search..." />
      </div>
    </header>
  );
};

export default HeaderSection;
