# Forex Trading Journal Backend

This folder contains the Python Lambda function and deployment scripts for the backend service.

---

## Deployment

This project uses a shell script for repeatable, automated deployments.

**_Crucial Prerequisite for Windows Users_**
> You **must** run the deployment script (`deploy.sh`) inside a bash-compatible shell. The standard Windows Command Prompt (CMD) or PowerShell will **not** work.
>
> The recommended and easiest way to do this is to install **[Git for Windows](https://git-scm.com/download/win)** and use the **Git Bash** terminal that comes with it.

**Prerequisites:**
1.  **Bash Shell:** A bash-compatible shell is required. (See note for Windows users above).
2.  **AWS CLI:** Ensure the AWS CLI is installed and configured (`aws configure`).
3.  **Python & Pip:** Ensure Python 3.10 and `pip` are installed.

**Deployment Steps:**

1.  **Open a Bash Shell:**
    - On Windows, navigate to the project directory, right-click, and select "Git Bash Here".
    - On macOS or Linux, open your standard terminal.
    - Navigate into the `backend` directory: `cd backend`

2.  **Set Environment Variables:**
    Before running the deployment script, you must set the following environment variables in your terminal session.

    ```bash
    export AWS_REGION="eu-central-1"
    export AWS_ACCOUNT_ID="177078044036"
    export LAMBDA_NAME="APITradingDiary"
    export DATABASE_URL="postgresql://hans.kristanto:RK66Y5XV1x9fbIzynfw3rA@bean-pig-9592.j77.aws-eu-central-1.cockroachlabs.cloud:26257/algo?sslmode=require"
    ```

3.  **Make Script Executable (First time only):**
    You only need to do this once:
    ```bash
    chmod +x deploy.sh
    ```

4.  **Run the Deployment Script:**
    Execute the main deployment script:
    ```bash
    ./deploy.sh
    ```

---

### How the Deployment Script Works

The `deploy.sh` script automates the entire deployment process:
-   **Packages Code:** The script first creates a zip file of your application code and its dependencies.
-   **Deploys Clean Lambda:** Deletes the old Lambda function (if it exists) and creates a new one. This ensures a clean deployment every time.
-   **Preserves API Gateway:** Checks if an API Gateway with the name `${LAMBDA_NAME}-api` already exists.
    -   If it exists, it reuses it, preserving the URL.
    -   If it doesn't exist, it creates a new one.
-   **Updates Routes:** It automatically reconfigures the API routes to point to the newly deployed Lambda function.
-   **Outputs URL:** At the end, it prints the stable API endpoint URL.

---

### Manual File Descriptions
-   `app.py`: The main Python code for the Lambda function.
-   `requirements.txt`: Python dependencies.
-   `deploy.sh`: The main script for deploying the entire backend stack.
-   `role.json`: IAM trust policy for the Lambda function.
