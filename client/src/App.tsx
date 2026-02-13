import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const BlogsPage = lazy(() => import("@/pages/BlogsPage"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const BlogCreate = lazy(() => import("@/pages/BlogCreate"));
const BlogEdit = lazy(() => import("@/pages/BlogEdit"));

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/blogs" component={BlogsPage} />
            <Route path="/blogs/:slug" component={BlogDetail} />
            <Route path="/admin/blogs/new" component={BlogCreate} />
            <Route path="/admin/blogs/:slug/edit" component={BlogEdit} />
            <Route>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-muted-foreground">Page not found</p>
                </div>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
