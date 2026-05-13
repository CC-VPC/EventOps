pipeline{
    agent any

    stages{
        stage("Build"){
            steps{
                echo "Building demo event-ops..."
            }
        }
        stage("Test"){
            steps{
                echo "Testing demo event-ops..."
            }
        }
        stage("Run app"){
            steps{
                sh 'python3 app.py'
            }
        }

    }
}