import Navigation from "@/components/site";
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server'


import { dark } from '@clerk/themes';

const layout = ({ children }: { children: React.ReactNode }) => {

  const user = auth();

  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <main>
        <Navigation user={user} />
        {children}
      </main>
    </ClerkProvider>
  );
};

export default layout;
