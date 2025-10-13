import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Staking from "@/pages/staking";
import Airdrop from "@/pages/airdrop";
import IncomeHistory from "@/pages/income-history";
import Whitepaper from "@/pages/whitepaper";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/staking" component={Staking} />
      <Route path="/airdrop" component={Airdrop} />
      <Route path="/income-history" component={IncomeHistory} />
      <Route path="/whitepaper" component={Whitepaper} />
      <Route path="/kb-admin-login" component={AdminLogin} />
      <Route path="/kb-admin-007" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
