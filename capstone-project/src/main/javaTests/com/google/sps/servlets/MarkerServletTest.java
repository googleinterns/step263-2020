package com.google.sps.servlets;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.appengine.api.datastore.*;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.gson.Gson;
import com.google.sps.data.Marker;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.GeneralSecurityException;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(JUnit4.class)
public final class MarkerServletTest {

    private static final LocalServiceTestHelper helper =
            new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
    private static Marker marker;
    private static Entity markerEntity;
    private static HttpServletRequest request;
    private static HttpServletResponse response;
    private static StringWriter stringWriter;
    private static PrintWriter writer;
    private static Gson gson;
    private static String markerJson;
    private static DatastoreService datastoreService;
    private static MockServletContext mockServletContext;
    private static MarkerServlet spiedServlet;
    private static String fakeToken;
    private static String fakeId;
    private static String secondFakeId;
    private static final int CREATE_CODE = Action.CREATE.ordinal();
    private static final int UPDATE_CODE = Action.UPDATE.ordinal();
    private static final int DELETE_CODE = Action.DELETE.ordinal();

    @Before
    public void setUp() throws IOException {
        helper.setUp();
        marker = new Marker.Builder()
                .setId(1111)
                .setLat(1)
                .setLng(1)
                .setAnimal("animal")
                .setReporter("reporter")
                .setDescription("description")
                .setUserId(Optional.empty())
                .setBlobKey("blobKey")
                .build();
        markerEntity = new Entity("Marker", 1111);
        markerEntity = Marker.toEntity(marker, markerEntity);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        stringWriter = new StringWriter();
        writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);
        gson = new Gson();
        markerJson = gson.toJson(marker);
        datastoreService = DatastoreServiceFactory.getDatastoreService();
        // Mock ServletContext or else we get an error
        mockServletContext = new MockServletContext();
        spiedServlet = Mockito.spy(MarkerServlet.class);
        Mockito.doReturn(mockServletContext).when(spiedServlet).getServletContext();
        fakeId = "123";
        secondFakeId = "234";
        fakeToken = "";
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    private void setVerifierMock() throws IOException, GeneralSecurityException {
        GoogleIdTokenVerifier mockVerifier = mock(GoogleIdTokenVerifier.class);
        GoogleIdToken googleIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        Mockito.doReturn(mockVerifier).when(spiedServlet).createGoogleIdTokenVerifier();
        when(mockVerifier.verify(fakeToken)).thenReturn(googleIdToken);
        when(googleIdToken.getPayload()).thenReturn(payload);
        when(payload.getSubject()).thenReturn(fakeId);
    }

    @Test
    // Test the doGet method when datastore is empty
    public void doGetDatastoreEmpty() throws IOException {
        new MarkerServlet().doGet(request, response);

        assertEquals("[]\n", stringWriter.toString());
    }

    @Test
    // Test the doGet method when datastore has marker
    public void doGetDatastoreNotEmpty() throws IOException {
        datastoreService.put(markerEntity);

        new MarkerServlet().doGet(request, response);

        assertTrue(stringWriter.toString().contains(markerJson));
    }

    @Test
    // Test the UPDATE case when the marker is not in datastore
    public void doPostCaseUpdateNoMarker() throws IOException {
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(UPDATE_CODE));
        when(request.getParameter("userToken")).thenReturn("undefined");
        spiedServlet.doPost(request, response);

        assertTrue(mockServletContext.throwable.toString().contains(new EntityNotFoundException(markerEntity.getKey()).toString()));
    }

    @Test
    // Test the DELETE case when the marker is not in datastore
    public void doPostCaseDeleteNoMarker() throws IOException {
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(DELETE_CODE));
        when(request.getParameter("userToken")).thenReturn("undefined");
        when(request.getParameter("id")).thenReturn(Long.toString(marker.getId()));

        spiedServlet.doPost(request, response);

        assertTrue(mockServletContext.throwable.toString().contains(new EntityNotFoundException(markerEntity.getKey()).toString()));
    }

    @Test
    // Test the CREATE case when the user is undefined
    public void doPostCaseCreateNoUser() throws IOException, EntityNotFoundException {
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(CREATE_CODE));
        when(request.getParameter("userToken")).thenReturn("undefined");

        // Perform the doPost and get the marker Id back so we can search for it
        spiedServlet.doPost(request, response);
        Map<String,String> responseParameter = gson.fromJson(String.valueOf(stringWriter), Map.class);

        // Create the entity identical to the one put in the datastore
        // We cannot edit the current markerEntity because the id is set in the Entity constructor
        markerEntity = new Entity("Marker", Long.parseLong(responseParameter.get("id")));
        markerEntity = Marker.toEntity(marker, markerEntity);

        assertEquals(datastoreService.get(markerEntity.getKey()), markerEntity);
    }

    @Test
    // Test the CREATE case with user
    public void doPostCaseCreateWithUser() throws IOException, EntityNotFoundException, GeneralSecurityException {
        // Set the marker userId to the fakeId
        marker.setUserId(Optional.of(fakeId));

        // Set request parameters
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(CREATE_CODE));
        when(request.getParameter("userToken")).thenReturn(fakeToken);

        // Mock the verifier
        setVerifierMock();

        // Perform the doPost and get the marker Id back so we can search for it
        spiedServlet.doPost(request, response);
        Map<String,String> responseParameter = gson.fromJson(String.valueOf(stringWriter), Map.class);

        // Create the entity identical to the one put in the datastore
        markerEntity = new Entity("Marker", Long.parseLong(responseParameter.get("id")));
        markerEntity = Marker.toEntity(marker, markerEntity);

        assertEquals(datastoreService.get(markerEntity.getKey()), markerEntity);
    }

    @Test
    // Test the UPDATE case with correct user
    public void doPostCaseUpdateWithCorrectUser() throws IOException, EntityNotFoundException, GeneralSecurityException {
        // Put old marker in datastore
        marker.setUserId(Optional.of(fakeId));
        markerEntity = Marker.toEntity(marker, markerEntity);
        datastoreService.put(markerEntity);

        // Change the marker
        marker = new Marker.Builder()
                .setId(1111)
                .setLat(1)
                .setLng(1)
                .setAnimal("animal2")
                .setReporter("reporter2")
                .setDescription("description2")
                .setUserId(Optional.of(fakeId))
                .setBlobKey("blobKey")
                .build();
        markerJson = gson.toJson(marker);

        // Set request parameters
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(UPDATE_CODE));
        when(request.getParameter("userToken")).thenReturn(fakeToken);

        // Mock the verifier
        setVerifierMock();

        // Perform the doPost
        spiedServlet.doPost(request, response);

        // Update the markerEntity to be of new marker
        markerEntity = Marker.toEntity(marker, markerEntity);

        assertEquals(datastoreService.get(markerEntity.getKey()), markerEntity);
    }

    @Test
    // Test the DELETE case with correct user
    public void doPostCaseDeleteWithCorrectUser() throws IOException, EntityNotFoundException, GeneralSecurityException {
        // Put marker in datastore
        marker.setUserId(Optional.of(fakeId));
        markerEntity = Marker.toEntity(marker, markerEntity);
        datastoreService.put(markerEntity);

        // Set request parameters
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(DELETE_CODE));
        when(request.getParameter("userToken")).thenReturn(fakeToken);
        when(request.getParameter("id")).thenReturn(Long.toString(marker.getId()));

        // Mock the verifier
        setVerifierMock();

        // Perform the doPost
        spiedServlet.doPost(request, response);

        // Check that the entity is no longer in datastore
        assertThrows(EntityNotFoundException.class, () -> {
            datastoreService.get(markerEntity.getKey());
        });
    }

    @Test
    // Test the UPDATE case with unauthorized user
    public void doPostCaseUpdateWithUnauthorizedUser() throws IOException, GeneralSecurityException {
        // Put marker in datastore with second fake Id
        marker.setUserId(Optional.of(secondFakeId));
        markerEntity = Marker.toEntity(marker, markerEntity);
        datastoreService.put(markerEntity);

        // Set request parameters, with token that returns the first fake Id
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(UPDATE_CODE));
        when(request.getParameter("userToken")).thenReturn(fakeToken);

        // Mock the verifier
        setVerifierMock();

        // Perform the doPost
        spiedServlet.doPost(request, response);

        assertTrue(mockServletContext.throwable.toString().contains(new GeneralSecurityException().toString()));
    }

    @Test
    // Test the DELETE case with unauthorized user
    public void doPostCaseDeleteWithUnauthorizedUser() throws IOException, GeneralSecurityException {
        // Put marker in datastore with second fake Id
        marker.setUserId(Optional.of(secondFakeId));
        markerEntity = Marker.toEntity(marker, markerEntity);
        datastoreService.put(markerEntity);

        // Set request parameters, with token that returns the first fake Id
        when(request.getParameter("marker")).thenReturn(markerJson);
        when(request.getParameter("action")).thenReturn(Integer.toString(DELETE_CODE));
        when(request.getParameter("userToken")).thenReturn(fakeToken);
        when(request.getParameter("id")).thenReturn(Long.toString(marker.getId()));

        // Mock the verifier
        setVerifierMock();

        // Perform the doPost
        spiedServlet.doPost(request, response);

        assertTrue(mockServletContext.throwable.toString().contains(new GeneralSecurityException().toString()));
    }

}