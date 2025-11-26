<!-- Multiple hash routers can coexist! -->
<Router hash="sidebar" id="sidebar-router">
  <Route hash="sidebar" key="nav" path="/nav">
    <SidebarNavigation />
  </Route>
</Router>

<Router hash="main" id="main-router">
  <Route hash="main" key="dashboard" path="/dashboard">
    <DashboardView />
  </Route>
</Router>
