#!/bin/bash
trap terminate SIGINT
terminate(){
    pkill -SIGINT -P $$
    exit
}
#the rest of your code goes here
bash json-server.bash &
bash frontend-server.bash &
wait
