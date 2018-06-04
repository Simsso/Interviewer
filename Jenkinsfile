pipeline {
    agent any
    environment {
        CI = 'true' 
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'mov "env.sample" ".env"'
            }
        }
        stage('Test') { 
            steps {
                sh 'npm test' 
            }
        }
    }
}