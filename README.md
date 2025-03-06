## Task
We would like you to create a Nest.js API that can publish and subscribe to messages on a queue. No need to worry about authorisation or authentication at this stage.

We would like the ability to swap out queue implementations based on environment variables e.g. SQS, RabbitMQ. You can look at using [Nest.js Dynamic modules](http://nest.js)

Changing queue providers should not require any code changes. Please consider [Two Factor Apps](https://12factor.net/) when designing this API.

Please include running instructions and a docker compose file to emulate and run the environment. You can use [Localstack](https://www.localstack.cloud/) to emulate AWS SQS.

Considerations:

-   How can I use both queues at once?
	- Handled via env
    
-   How can I write the app to test it and have queues ready?
	- E2E. We could create a separate test container and make this E2E run on test-queue, if all good we can bootstrap the main-queue


## Demo

[Watch Video](https://github.com/0xdebugit/nestjs-multi-queue/blob/main/demo-queue.mp4)

## Project setup

```bash
docker-compose  up  --build  -d
```

## Send Message to Queue

```bash

$  curl  -X  POST  http://localhost:3000/publish  -H  "Content-Type: application/json"  -d  '{"value": "Hello from CLI"}'

```

## Receive Message from Queue

```bash

$  curl  -X  GET  http://localhost:3000/consume 

```

## Run tests

```bash
# e2e tests
$  npm  run  test:e2e
```
