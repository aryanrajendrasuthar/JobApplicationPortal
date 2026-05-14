FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN apk add --no-cache bash && chmod +x mvnw
COPY src src
RUN JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 mvn package -DskipTests -q 2>/dev/null || \
    mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
