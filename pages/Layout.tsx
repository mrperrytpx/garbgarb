import type { ReactNode } from 'react'
import Header from '../components/Header'

type Props = {
  children?: ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
};

export default Layout;