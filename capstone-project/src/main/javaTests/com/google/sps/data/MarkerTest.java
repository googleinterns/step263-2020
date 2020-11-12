package com.google.sps.data;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

@RunWith(JUnit4.class)
public final class MarkerTest {

    private static Marker marker;
    private static Entity markerEntity;
    private static final LocalServiceTestHelper helper =
            new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

    @Before
    public void setUp() {
        marker = new Marker.Builder()
                .setId(1111)
                .setLat(1)
                .setLng(1)
                .setAnimal("animal")
                .setReporter("reporter")
                .setDescription("description")
                .setUserId(Optional.of("userId"))
                .setBlobKey("blobKey")
                .build();
        helper.setUp();
        markerEntity = new Entity("Marker");
        markerEntity.setProperty("lat", 1.0);
        markerEntity.setProperty("lng", 1.0);
        markerEntity.setProperty("animal", "animal");
        markerEntity.setProperty("reporter", "reporter");
        markerEntity.setProperty("description", "description");
        markerEntity.setProperty("blobKey", "blobKey");
        markerEntity.setProperty("userId", "userId");
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    @Test
    public void createMarker() {
        assertTrue(marker != null);
    }

    @Test
    public void initializeMarkerFields() {
        assertEquals(1111, marker.getId());
        assertEquals(1, marker.getLat());
        assertEquals(1, marker.getLng());
        assertEquals("animal", marker.getAnimal());
        assertEquals("reporter", marker.getReporter());
        assertEquals("description", marker.getDescription());
        assertEquals(Optional.of("userId"), marker.getUserId());
        assertEquals("blobKey", marker.getBlobKey());
    }

    @Test
    public void entityToMarker() {
        Entity spiedEntity = spy(markerEntity);
        Key spiedKey = spy(Key.class);
        when(spiedEntity.getKey()).thenReturn(spiedKey);
        when(spiedKey.getId()).thenReturn((long) 1111);

        Marker conversionResult = Marker.fromEntity(spiedEntity);

        assertEquals(conversionResult, marker);
    }

    @Test
    public void markerToNewEntity() {
        Entity conversionResult = Marker.toEntity(marker);

        assertEquals(conversionResult.getProperties(), markerEntity.getProperties());
    }

    @Test
    public void markerToExistingEntity() {
        Entity entityToSend = new Entity("Marker");

        Entity conversionResult = Marker.toEntity(marker, entityToSend);

        assertEquals(conversionResult.getProperties(), markerEntity.getProperties());
    }
}