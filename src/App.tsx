import { AmpersandProvider, InstallIntegration } from '@amp-labs/react'
import '@amp-labs/react/styles'; 

// You can customize the component's styles here
// See https://docs.withampersand.com/embeddable-ui-components#customize-styles
import './App.css';

const options = {
  project: 'MY-PROJECT-NAME', // Replace with your Ampersand project name or ID.
  apiKey: 'MY-API-KEY',// Replace with your Ampersand API key, create one in the Ampersand dashboard.
};

function App() {

  // This must match the integration name in integrations/amp.yaml
  const integration = "hubspotCRM";

  // You can learn more about the parameters in
  // https://docs.withampersand.com/embeddable-ui-components#install-integration
  return (
    <AmpersandProvider options = {options}>
      <InstallIntegration 
        integration = {integration}
        consumerName = "demo-user-name"
        consumerRef = "demo-user-id"
        groupName = "demo-company-name"
        groupRef = "demo-company-id"
      />
    </AmpersandProvider>
  )
}

export default App
