# AWS App Runner Deployment Guide

This guide will help you deploy your Retell AI Legal Dashboard to AWS App Runner - a faster and more suitable option than Amplify for Next.js applications with API routes.

## 🚀 Why App Runner?

- **Faster deployment** (2-3 minutes vs 5-10 minutes)
- **Better API routes support** for your `/api/calls` endpoints
- **Automatic scaling** based on traffic
- **Cost-effective** pay-per-use pricing
- **Simple configuration** with Docker

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Retell AI API Key** from your dashboard
3. **Git Repository** (GitHub, GitLab, or Bitbucket)
4. **Docker** (for local testing, optional)

## Step 1: Prepare Your Repository

1. **Commit all changes** to your Git repository
2. **Push to your remote repository**

## Step 2: Create AWS App Runner Service

### Option A: Using AWS Console (Recommended)

1. Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner/)
2. Click **"Create an App Runner service"**
3. Choose **"Source"** → **"Source code repository"**
4. Connect your Git provider and select your repository
5. Choose **"Deploy from source"**
6. Configure the following:

#### Build Settings:
- **Runtime**: Docker
- **Build command**: `docker build -t retell-legal-dashboard .`
- **Start command**: `node server.js`

#### Service Settings:
- **Service name**: `retell-legal-dashboard`
- **Virtual CPU**: 0.25 vCPU (or higher for production)
- **Virtual memory**: 0.5 GB (or higher for production)
- **Port**: 3000

### Option B: Using AWS CLI

```bash
# Create App Runner service
aws apprunner create-service \
  --service-name "retell-legal-dashboard" \
  --source-configuration '{
    "CodeRepository": {
      "RepositoryUrl": "https://github.com/yourusername/retell-ai-legal-dashboard",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "REPOSITORY",
        "CodeConfigurationValues": {
          "Runtime": "DOCKER",
          "BuildCommand": "docker build -t retell-legal-dashboard .",
          "StartCommand": "node server.js",
          "RuntimeEnvironmentVariables": {
            "NODE_ENV": "production",
            "PORT": "3000"
          }
        }
      }
    }
  }' \
  --instance-configuration '{
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  }'
```

## Step 3: Configure Environment Variables

1. In the App Runner console, go to your service
2. Click **"Configuration"** tab
3. Go to **"Environment"** section
4. Add the following environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `RETELL_API_KEY` | Your actual API key | Required for API routes |
| `NODE_ENV` | `production` | Environment setting |
| `PORT` | `3000` | Application port |

## Step 4: Deploy

1. Click **"Create & deploy"** in the App Runner console
2. Wait for the deployment to complete (2-3 minutes)
3. Your app will be available at the provided App Runner URL

## Step 5: Custom Domain (Optional)

1. In the App Runner console, go to **"Custom domains"**
2. Click **"Add domain"**
3. Enter your custom domain
4. Follow the DNS configuration instructions

## 🔧 Configuration Files

### Dockerfile
- Optimized for Next.js with standalone output
- Multi-stage build for smaller image size
- Proper user permissions and security

### .dockerignore
- Excludes unnecessary files from Docker build
- Reduces image size and build time

### apprunner.yaml
- App Runner specific configuration
- Runtime and build settings

## 🧪 Local Testing (Optional)

Test your Docker setup locally:

```bash
# Build the Docker image
docker build -t retell-legal-dashboard .

# Run the container
docker run -p 3000:3000 -e RETELL_API_KEY=your_key_here retell-legal-dashboard

# Test the application
curl http://localhost:3000
```

## 📊 Monitoring and Logs

1. **CloudWatch Logs**: View application logs
2. **CloudWatch Metrics**: Monitor performance
3. **App Runner Console**: View service status and health

## 🔄 Continuous Deployment

App Runner automatically redeploys when you push changes to your repository branch.

## 💰 Cost Optimization

- **Start with minimal resources** (0.25 vCPU, 0.5 GB RAM)
- **Scale up** based on actual usage
- **Use auto-scaling** to handle traffic spikes
- **Monitor costs** in AWS Cost Explorer

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Dockerfile syntax
   - Verify all dependencies are in package.json
   - Check build logs in App Runner console

2. **API Routes Not Working**:
   - Verify environment variables are set
   - Check that RETELL_API_KEY is correct
   - Review application logs

3. **Application Won't Start**:
   - Check the start command in App Runner
   - Verify port configuration (should be 3000)
   - Review container logs

### Debug Commands:

```bash
# Check App Runner service status
aws apprunner describe-service --service-arn your-service-arn

# View recent logs
aws logs describe-log-groups --log-group-name-prefix /aws/apprunner
```

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality** in the deployed app
2. **Set up monitoring** and alerts
3. **Configure custom domain** if needed
4. **Set up CI/CD** for automatic deployments
5. **Monitor costs** and optimize resources

## 📚 Additional Resources

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [AWS App Runner Pricing](https://aws.amazon.com/apprunner/pricing/)

## Support

If you encounter issues:
1. Check the App Runner service logs
2. Verify environment variables are set correctly
3. Ensure your Retell AI API key is valid
4. Review the AWS App Runner troubleshooting guide
