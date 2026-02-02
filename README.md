<br/>
<div align="center">
    <a href="https://www.withampersand.com/?utm_source=github&utm_medium=readme&utm_campaign=mcp-docs-server&utm_content=logo">
    <img src="https://res.cloudinary.com/dycvts6vp/image/upload/v1723671980/ampersand-logo-black.svg" height="30" align="center" alt="Ampersand logo" >
    </a>
<br/>
<br/>

<div align="center">

 [![Discord](https://img.shields.io/badge/Join%20The%20Community-black?logo=discord)](https://discord.gg/BWP4BpKHvf) [![Documentation](https://img.shields.io/badge/Read%20our%20Documentation-black?logo=book)](https://docs.withampersand.com) ![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) <img src="https://img.shields.io/static/v1?label=license&message=MIT&color=white" alt="License">
</div>

</div>

# Ampersand Starter Project

This is a starter project for [Ampersand](https://www.withampersand.com). It contains:
- A minimal React + Vite app that embeds the `InstallIntegration` UI component.
- An integration for HubSpot, defined in `integrations/hubspot/amp.yaml`, and an integration for Salesforce is defined in `integrations/salesforce/amp.yaml`. You can replace these with any other integration from the [samples repo](https://github.com/amp-labs/samples).

## Prerequisites

1. Sign up for a [free Ampersand account](https://dashboard.withampersand.com/sign-up) and follow the prompts to create a new project.
2. Create an API key in the [API Keys](https://dashboard.withampersand.com/projects/_/api-keys) section of the Ampersand dashboard.
3. Create a destination in the [Destinations](https://dashboard.withampersand.com/projects/_/destinations) section of the Ampersand dashboard called `defaultWebhook`(for Hubspot) and `salesforceWebhook` (for Salesforce). If you don't have a webhook, you can create a temporary one at [https://play.svix.com](https://play.svix.com).
4. If you want to use the HubSpot integration, create a HubSpot account and HubSpot App by following the instructions in the [Hubspot guide](https://docs.withampersand.com/provider-guides/hubspot). If you want to use the Salesforce integration, follow the [Salesforce guide](https://docs.withampersand.com/provider-guides/salesforce). If you wish to use another integration instead, follow the appropriate [provider guide](https://docs.withampersand.com/provider-guides/overview).
5. Download the [Ampersand CLI](https://docs.withampersand.com/cli/overview) and run `amp login` to authenticate.

## Running the project

1. Clone the repository.
2. Run `npm install`.
3. If you do not wish to use the HubSpot or Salesforce integration, create a new folder for your integration inside the `integrations/` directory and add an `amp.yaml` file to it, either by copying from the [samples repo](https://github.com/amp-labs/samples) or create your own by [following the docs](https://docs.withampersand.com). Ensure the destination name in the `amp.yaml` file matches the destination created in the Ampersand dashboard.
4. Deploy the integration by running `amp deploy integrations -p <my-project-name>` in the root of the project.
5. Update `src/App.tsx` with:
  - Your project name and API key.
  - If you are not using the `hubspotCRM` integration, update the `integration` variable with the name of the integration folder inside the `integrations/` directory.
6. Run `npm run dev`.
