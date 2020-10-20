import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export interface NavItemProps {
  title: string;
  link: string;
  links: { title: string; link: string }[];
}

const renderLinks = (links: any) => {
  const linkList = links.map(
    (item: { title: string; link: string }, index: number) => {
      return (
        <li key={index}>
          <Link to={item.link}>{item.title}</Link>
        </li>
      );
    }
  );
  return linkList;
};

const NavItem: React.FC<NavItemProps> = ({ title, links, link }) => {
  const [itemIsOpen, setItemIsOpen] = useState(false);
  return (
    <div>
      <Link onClick={() => setItemIsOpen(!itemIsOpen)} to={link}>
        {title}
      </Link>
      {itemIsOpen ? <ul>{renderLinks(links)}</ul> : null}
    </div>
  );
};

export default NavItem;
