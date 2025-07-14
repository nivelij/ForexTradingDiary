#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Change to the script's directory
cd "$(dirname "$0")"

# --- Configuration ---
# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

# This script uses environment variables for configuration.
# Please set the following before running:
# - AWS_REGION
# - AWS_ACCOUNT_ID
# - LAMBDA_NAME

# --- Validation ---
if [ -z "$AWS_REGION" ] || [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$LAMBDA_NAME" ]; then
  echo "Error: Please set all required environment variables: AWS_REGION, AWS_ACCOUNT_ID, LAMBDA_NAME"
  exit 1
fi

echo "--- Step 1: Deleting API Gateway ---"
API_NAME="${LAMBDA_NAME}-api"
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='${API_NAME}'].id" --output text)

if [ -z "$API_ID" ]; then
  echo "API Gateway '${API_NAME}' not found. Skipping deletion."
else
  echo "Deleting API Gateway '${API_NAME}' (ID: ${API_ID})..."
  aws apigateway delete-rest-api --rest-api-id ${API_ID}
  echo "API Gateway deleted successfully."
fi

echo "--- Step 2: Deleting Lambda function ---"
if aws lambda get-function --function-name ${LAMBDA_NAME} > /dev/null 2>&1; then
  echo "Lambda function '${LAMBDA_NAME}' found. Deleting it..."
  aws lambda delete-function --function-name ${LAMBDA_NAME}
  echo "Waiting for deletion to complete..."
  sleep 15
  aws lambda wait function-not-exists --function-name ${LAMBDA_NAME} --no-paginate
  echo "Lambda function deleted successfully."
else
  echo "Lambda function '${LAMBDA_NAME}' not found. Skipping deletion."
fi

echo "--- Step 3: Deleting IAM Role ---"
ROLE_NAME="${LAMBDA_NAME}-role"
if aws iam get-role --role-name ${ROLE_NAME} > /dev/null 2>&1; then
  echo "IAM Role '${ROLE_NAME}' found. Deleting it..."
  # Detach any attached policies (optional, but good practice)
  MANAGED_POLICIES=$(aws iam list-attached-role-policies --role-name ${ROLE_NAME} --query 'AttachedPolicies[].PolicyArn' --output text)
  for POLICY_ARN in $MANAGED_POLICIES; do
    echo "Detaching managed policy: ${POLICY_ARN}"
    aws iam detach-role-policy --role-name ${ROLE_NAME} --policy-arn ${POLICY_ARN}
  done
  INLINE_POLICIES=$(aws iam list-role-policies --role-name ${ROLE_NAME} --query 'PolicyNames' --output text)
    for POLICY_NAME in $INLINE_POLICIES; do
    echo "Deleting inline policy: ${POLICY_NAME}"
    aws iam delete-role-policy --role-name ${ROLE_NAME} --policy-name ${POLICY_NAME}
  done
  aws iam delete-role --role-name ${ROLE_NAME}
  echo "IAM Role deleted successfully."
else
  echo "IAM Role '${ROLE_NAME}' not found. Skipping deletion."
fi

echo "--- Teardown Complete ---"
