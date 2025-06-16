FROM openbao/openbao:2.2

RUN apk add fish

COPY . ./

RUN chmod +x ./start.fish

ENTRYPOINT [ "./start.fish" ]