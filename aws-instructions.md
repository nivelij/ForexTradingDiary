I want you to build and deploy an AWS lambda services that can serve as the backend for my swing trading journal application. The language you use must be python3.10

I already created all the database schema in cockroachdb with the following credentails: postgresql://hans.kristanto:RK66Y5XV1x9fbIzynfw3rA@bean-pig-9592.j77.aws-eu-central-1.cockroachlabs.cloud:26257/algo?sslmode=require

Your task is to create an AWS lambda service, hooked with API gateway, with the following operations:
* POST /account
* GET /account
* POST /trade
* GET /trade
* GET /analytics

I have the following AWS lambda layer for all the database ops library: arn:aws:lambda:eu-central-1:177078044036:layer:DataOpsLayer:1, so make sure to include it

About my aws account, this is the details:
* 177078044036