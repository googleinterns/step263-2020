// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.data;

import com.google.appengine.api.datastore.Entity;

import java.util.Objects;
import java.util.Optional;

/** Represents an animal report marker on the map. */
public class Marker {

    public static class Builder {

        private long id;
        private double lat;
        private double lng;
        private String animal;
        private String reporter;
        private String description;
        private Optional<String> userId;
        private String blobKey;

        public Builder(){
        }

        public Builder setId(long id){
            this.id = id;
            return this;
        }

        public Builder setLat(double lat){
            this.lat = lat;
            return this;
        }

        public Builder setLng(double lng){
            this.lng = lng;
            return this;
        }

        public Builder setAnimal(String animal){
            this.animal = animal;
            return this;
        }

        public Builder setReporter(String reporter){
            this.reporter = reporter;
            return this;
        }

        public Builder setDescription(String description){
            this.description = description;
            return this;
        }

        public Builder setUserId(Optional<String> userId){
            this.userId = userId;
            return this;
        }
        
        public Builder setBlobKey(String blobKey){
            this.blobKey = blobKey;
            return this;
        }

        public Marker build(){
            return new Marker(this);
        }
    }

    private final long id;
    private final double lat;
    private final double lng;
    private final String animal;
    private final String reporter;
    private final String description;
    private Optional<String> userId;
    private String blobKey;

    private Marker(Builder builder) {
        this.id = builder.id;
        this.lat = builder.lat;
        this.lng = builder.lng;
        this.animal = builder.animal;
        this.reporter = builder.reporter;
        this.description = builder.description;
        this.userId = builder.userId;
        this.blobKey = builder.blobKey;
    }

    public long getId() {
        return id;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }

    public String getAnimal() {
        return animal;
    }

    public String getReporter() {
        return reporter;
    }

    public String getDescription() {
        return description;
    }

    public void setUserId(Optional<String> userId){
        this.userId = userId;
    }

    public Optional<String> getUserId(){
        return userId;
    }

    public String getBlobKey() {
        return blobKey;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Marker other = (Marker) o;
        return id == other.id &&
                Double.compare(other.lat, lat) == 0 &&
                Double.compare(other.lng, lng) == 0 &&
                Objects.equals(animal, other.animal) &&
                Objects.equals(reporter, other.reporter) &&
                Objects.equals(description, other.description) &&
                Objects.equals(userId, other.userId) &&
                Objects.equals(blobKey, other.blobKey);
    }

    /** Creates a Marker from a marker entity */
    public static Marker fromEntity(Entity entity){
        long id = entity.getKey().getId();
        double lat = (double) entity.getProperty("lat");
        double lng = (double) entity.getProperty("lng");
        String animal = (String) entity.getProperty("animal");
        String reporter = (String) entity.getProperty("reporter");
        String description = (String) entity.getProperty("description");
        String blobKey = (String) entity.getProperty("blobKey");
        Optional<String> userId = Optional.empty();
        if (entity.hasProperty("userId")){
            userId = Optional.of((String) entity.getProperty("userId"));
        }

        return new Marker.Builder()
                .setId(id)
                .setLat(lat)
                .setLng(lng)
                .setAnimal(animal)
                .setReporter(reporter)
                .setDescription(description)
                .setUserId(userId)
                .setBlobKey(blobKey)
                .build();
    }

    /** Creates a marker entity from a Marker */
    public static Entity toEntity(Marker marker){
        Entity markerEntity = new Entity("Marker");
        return setEntityProperties(marker, markerEntity);
    }

    // Overwrites a given entity's fields to update the data.
    public static Entity toEntity(Marker marker, Entity markerEntity){
        return setEntityProperties(marker, markerEntity);
    }

    // Sets the properties of the marker entity
    private static Entity setEntityProperties (Marker marker, Entity markerEntity) {
        markerEntity.setProperty("lat", marker.getLat());
        markerEntity.setProperty("lng", marker.getLng());
        markerEntity.setProperty("animal", marker.getAnimal());
        markerEntity.setProperty("reporter", marker.getReporter());
        markerEntity.setProperty("description", marker.getDescription());
        markerEntity.setProperty("blobKey", marker.getBlobKey());
        if (marker.getUserId().isPresent()){
            markerEntity.setProperty("userId", marker.getUserId().get());
        }
        return markerEntity;
    }
}