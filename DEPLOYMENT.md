# GymAI Deployment Guide

## Best Deployment Platforms

### 🏆 **Recommended Options**

#### 1. **AWS EC2 or Lightsail** ⭐ BEST CHOICE
**Why:** Full control, camera access, real-time processing support

**Pros:**
- ✅ Full system access (can access USB cameras)
- ✅ Install any dependencies
- ✅ Handle real-time video processing
- ✅ Scalable and reliable
- ✅ Good for production

**Cons:**
- ⚠️ Requires server management knowledge
- ⚠️ Paid (but reasonable pricing)

**Setup:**
- Launch Ubuntu/Amazon Linux instance
- Install dependencies (OpenCV, MediaPipe, etc.)
- Configure camera access
- Use PM2 or systemd to keep app running

---

#### 2. **DigitalOcean Droplet** ⭐ ALSO GREAT
**Why:** Simple VPS, good pricing, full control

**Pros:**
- ✅ Full root access
- ✅ Easy to set up
- ✅ Camera access possible
- ✅ $6/month for basic droplet
- ✅ Good documentation

**Cons:**
- ⚠️ Need to manage server yourself
- ⚠️ Camera setup may require configuration

**Setup:**
- Create Ubuntu droplet
- Install Python, OpenCV, MediaPipe
- Configure firewall and ports
- Use gunicorn + nginx

---

#### 3. **Railway** ⭐ EASIEST VPS OPTION
**Why:** Modern platform, easy deployment

**Pros:**
- ✅ Simple deployment from Git
- ✅ Automatic HTTPS
- ✅ Good free tier ($5 credit/month)
- ✅ Easy to scale

**Cons:**
- ⚠️ Camera access limited (may need workarounds)
- ⚠️ Better for testing than production with cameras

---

#### 4. **Render** ⭐ GOOD FOR DEMO
**Why:** Free tier available, easy setup

**Pros:**
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Automatic SSL
- ✅ Good for demos/prototypes

**Cons:**
- ⚠️ Camera access very limited
- ⚠️ May need to use video file input instead
- ⚠️ Sleeping on free tier

---

### 📋 **Platform Comparison**

| Platform | Camera Access | Difficulty | Cost | Best For |
|----------|--------------|------------|------|----------|
| AWS EC2 | ✅ Full | Medium | ~$10-20/mo | Production |
| DigitalOcean | ✅ Full | Medium | ~$6-12/mo | Production |
| Railway | ⚠️ Limited | Easy | $5/mo+ | Testing |
| Render | ❌ Limited | Easy | Free-$7/mo | Demo |
| Heroku | ❌ None | Easy | $7/mo+ | Not suitable |

---

## 🚀 **Recommended Deployment: AWS EC2**

### Step-by-Step Setup:

1. **Launch EC2 Instance:**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier) or t3.small
   - Security Group: Allow HTTP (80), HTTPS (443), and Custom TCP 5000

2. **Connect and Setup:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python and dependencies
   sudo apt install python3-pip python3-venv git -y
   
   # Install system dependencies for OpenCV
   sudo apt install libopencv-dev python3-opencv libgl1-mesa-glx libglib2.0-0 -y
   
   # Clone your repository
   git clone your-repo-url
   cd Gym-AI-Trainer
   
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   pip install gunicorn
   ```

3. **Configure for Production:**
   ```bash
   # Use gunicorn instead of Flask dev server
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

4. **Set up Nginx (optional but recommended):**
   ```bash
   sudo apt install nginx -y
   # Configure nginx reverse proxy
   ```

5. **Camera Access (if using USB camera):**
   ```bash
   # Install v4l2 for camera access
   sudo apt install v4l-utils -y
   # Test camera
   v4l2-ctl --list-devices
   ```

---

## 📝 **Alternative: Video File Input for Cloud Deployment**

If camera access is not possible, modify the app to accept video file uploads or use webcam.js for browser-based capture:

- Users' browsers handle camera access
- App processes frames server-side
- Works on any platform

---

## 🔧 **Required Files for Deployment**

### 1. `requirements.txt` - Create this file
```
Flask==3.1.2
opencv-python==4.12.0.88
mediapipe==0.10.21
numpy==1.26.4
```

### 2. `.gitignore` - Already exists
Your current .gitignore should exclude:
- `TrENV/` or `venv/`
- `__pycache__/`
- `*.pyc`
- `.env`

### 3. `Procfile` (for Heroku/Railway):
```
web: gunicorn app:app --bind 0.0.0.0:$PORT
```

### 4. `runtime.txt` (if needed):
```
python-3.12.0
```

---

## 💡 **Quick Start: Railway Deployment**

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add environment variables if needed
5. Deploy!

**Note:** For camera access on Railway, consider using webcam.js or video file uploads.

---

## 🎯 **My Recommendation**

**For Production:** Use **AWS EC2** or **DigitalOcean**
- Best camera support
- Full control
- Reliable for production

**For Testing/Demo:** Use **Railway** or **Render**
- Quick setup
- Good for demos
- May need to adapt for camera limitations

---

## ⚠️ **Important Notes**

1. **Camera Access:** Most cloud platforms don't support direct camera access. Consider:
   - Using browser-based camera capture (webcam.js)
   - Video file uploads
   - WebRTC for direct browser-to-server streaming

2. **Performance:** Real-time video processing is CPU-intensive:
   - Use appropriate instance sizes
   - Consider GPU instances for better performance

3. **Security:** 
   - Never expose camera feeds without authentication
   - Use HTTPS
   - Implement user authentication

4. **Scaling:** For multiple users:
   - Consider load balancing
   - Use Redis for session management
   - Optimize video processing

