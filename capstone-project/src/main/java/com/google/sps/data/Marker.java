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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;

/** Represents an animal report marker on the map. */
public class Marker {

    public static class Builder {

        private long id;
        private double lat;
        private double lng;
        private String animal;
        private String reporter;
        private String description;

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

    private Marker(Builder builder) {
        this.id = builder.id;
        this.lat = builder.lat;
        this.lng = builder.lng;
        this.animal = builder.animal;
        this.reporter = builder.reporter;
        this.description = builder.description;
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

    /** Creates a Marker from a marker entity */
    public static Marker fromEntity(Entity entity){
        long id = entity.getKey().getId();
        double lat = (double) entity.getProperty("lat");
        double lng = (double) entity.getProperty("lng");
        String animal = (String) entity.getProperty("animal");
        String reporter = (String) entity.getProperty("reporter");
        String description = (String) entity.getProperty("description");

        return new Marker.Builder()
                .setId(id)
                .setLat(lat)
                .setLng(lng)
                .setAnimal(animal)
                .setReporter(reporter)
                .setDescription(description)
                .build();
    }

    /** Creates a marker entity from a Marker */
    public static Entity toEntity(Marker marker){
        Entity markerEntity = new Entity("Marker");
        markerEntity.setProperty("lat", marker.getLat());
        markerEntity.setProperty("lng", marker.getLng());
        markerEntity.setProperty("animal", marker.getAnimal());
        markerEntity.setProperty("reporter", marker.getReporter());
        markerEntity.setProperty("description", marker.getDescription());
        return markerEntity;
    }

    // Finds the entity of the marker that needs to be updated using its ID and then overwrites its fields to update the data.
    public static Entity toEntity(Marker marker, Key markerEntityKey) throws EntityNotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Entity markerEntity = datastore.get(markerEntityKey);
        markerEntity.setProperty("lat", marker.getLat());
        markerEntity.setProperty("lng", marker.getLng());
        markerEntity.setProperty("animal", marker.getAnimal());
        markerEntity.setProperty("reporter", marker.getReporter());
        markerEntity.setProperty("description", marker.getDescription());
        return markerEntity;
    }
}