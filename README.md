# TaskBoard

Inspired by https://github.com/ierosodin/vue-simple-flowchart

## Build docker image
```
bash build_docker.bash
```

## Create kubectl configmap
```
kubectl create configmap task-board-configmap --from-file=cfg/
```


## Create deployments
```
kubectl apply -f deploy/storage.yaml
kubectl apply -f deploy/runtime.yaml
```

# default

## Project setup

```
# yarn
yarn

# npm
npm install

# pnpm
pnpm install
```

### Compiles and hot-reloads for development

```
# yarn
yarn dev

# npm
npm run dev

# pnpm
pnpm dev
```

### Compiles and minifies for production

```
# yarn
yarn build

# npm
npm run build

# pnpm
pnpm build
```

### Customize configuration

See [Configuration Reference](https://vitejs.dev/config/).


