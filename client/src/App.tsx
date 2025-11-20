import { Switch, Route } from "wouter";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Login from "@/pages/Login";
import CreatePost from "@/pages/CreatePost";
import Tools from "@/pages/Tools";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/create" component={CreatePost} />
        <Route path="/tools" component={Tools} />
        <Route path="/about" component={About} />
        <Route path="/post/:id" component={PostDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
